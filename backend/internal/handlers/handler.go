package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/NKyhl/whitebored/backend/internal/hub"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// HealthCheck returns a Gin handler function that responds with a simple
// JSON object indicating the server is running and healthy.
func HealthCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	}
}

// NewCanvas returns a Gin handler function that generates a new unique canvas ID,
// creates a new canvas in the hub, and sends the canvas ID back to the client.
func NewCanvas(h *hub.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate unique canvas ID
		var newID string
		for {
			newID = hub.GenerateCanvasCode(6)
			if !h.CanvasExists(newID) {
				break
			}
		}

		// Create Canvas data structure
		err := h.CreateCanvas(newID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    		return
		}

		// Send new canvasID back to client
		c.JSON(http.StatusOK, gin.H{"canvasID": newID})
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // TODO: tighten this for production
}

// WebSocket returns a Gin handler function that upgrades HTTP requests
// to WebSocket connections, registers the client with the hub and desired canvas,
// and sets up bidirectional communication with other users on this canvas.
func WebSocket(h *hub.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		canvasID := c.Param("id")
		if len(canvasID) > 20 {
			// canvasID is too long
			c.Redirect(http.StatusFound, "/")
			return
		}
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		clientID := uuid.New().String()
		client := &hub.Client{
			ID:		clientID,
			Send:	make(chan []byte, 256),
			Canvas:	canvasID,
		}

		h.AddClient(canvasID, client)
		defer func() {
			h.RemoveClient(canvasID, clientID)
			close(client.Send)
		}()

		// Writer goroutine - any messages pushed to this client's
		// channel (client.Send) will be written out to the WebSocket 
		// connection and sent to the real client in the browser
		go func() {
			for msg := range client.Send {
				_ = conn.WriteMessage(websocket.TextMessage, msg)
			}
		}()

		// Reader loop - listen for messages from the client over the
		// WebSocket and broadcast them to all other clients working on
		// the same canvas
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}

			var strokeMsg hub.StrokeMessage
			if err := json.Unmarshal(msg, &strokeMsg); err != nil {
				continue // Skip invalid JSON
			}

			if strokeMsg.Type == "stroke" {
				h.BroadcastStroke(canvasID, strokeMsg.Stroke)
			}
		}
	}
}