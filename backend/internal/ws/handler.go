package ws

import (
	"net/http"

	"github.com/NKyhl/whitebored/backend/internal/hub"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // TODO: tighten this for production
}

func HandleWebSocket(h *hub.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		canvasID := c.Param("id")
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		clientID := uuid.New().String()
		client := &hub.Client{
			ID:		clientID,
			Send:	make(chan []byte),
			Canvas:	canvasID,
		}

		h.AddClient(canvasID, client)
		defer h.RemoveClient(canvasID, clientID)

		// Writer goroutine
		go func() {
			for msg := range client.Send {
				_ = conn.WriteMessage(websocket.TextMessage, msg)
			}
		}()

		// Reader loop
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}
			h.Broadcast(canvasID, msg)
		}
	}
}