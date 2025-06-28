package hub

import (
	"encoding/json"
	"sync"
)

// Hub manages multiple canvases.
type Hub struct {
	Canvases map[string]*Canvas
	mu       sync.RWMutex
}

// NewHub initializes and returns a new Hub.
func NewHub() *Hub {
	return &Hub{
		Canvases: make(map[string]*Canvas),
	}
}

// CreateCanvas creates a new canvas with the given ID.
func (h *Hub) CreateCanvas(canvasID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.Canvases[canvasID]; !exists {
		h.Canvases[canvasID] = &Canvas{
			Clients: make(map[string]*Client),
			Strokes: []Stroke{},
		}
	}
}

// CanvasExists checks if a canvasID is being used or not
func (h *Hub) CanvasExists(canvasID string) bool {
	_, exists := h.Canvases[canvasID];
	return exists
}

// AddClient adds a client to a canvas, creating the canvas if needed,
// and sends existing strokes to the client.
func (h *Hub) AddClient(canvasID string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	canvas, exists := h.Canvases[canvasID]
	if !exists {
		canvas = &Canvas{
			Clients: make(map[string]*Client),
			Strokes: []Stroke{},
		}
		h.Canvases[canvasID] = canvas
	}

	canvas.Clients[client.ID] = client

	// Send existing strokes to the new client
	for _, stroke := range canvas.Strokes {
		msg := StrokeMessage{
			Type:   "stroke",
			Stroke: stroke,
		}
		data, err := json.Marshal(msg)
		if err != nil {
			continue
		}
		client.Send <- data
	}
}

// RemoveClient removes a client from a canvas, and deletes the canvas if empty
func (h *Hub) RemoveClient(canvasID, clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if canvas, ok := h.Canvases[canvasID]; ok {
		delete(canvas.Clients, clientID)

		if len(canvas.Clients) == 0 {
			delete(h.Canvases, canvasID) // Clean up empty canvas
		}
	}
}

// Broadcast sends a generic message to all clients on the specified canvas.
func (h *Hub) Broadcast(canvasID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	canvas, ok := h.Canvases[canvasID]
	if !ok {
		return
	}

	for _, client := range canvas.Clients {
		select {
		case client.Send <- message:
		default:
			// If client channel is full, drop the message to avoid blocking
		}
	}
}

// BroadcastStroke stores the stroke in canvas history and broadcasts it to clients.
func (h *Hub) BroadcastStroke(canvasID string, stroke Stroke) {
	h.mu.Lock()
	defer h.mu.Unlock()

	canvas, ok := h.Canvases[canvasID]
	if !ok {
		canvas = &Canvas{
			Clients: make(map[string]*Client),
			Strokes: []Stroke{},
		}
		h.Canvases[canvasID] = canvas
	}

	// Save the stroke
	canvas.Strokes = append(canvas.Strokes, stroke)

	// Prepare the message for broadcasting
	msg := StrokeMessage{
		Type:   "stroke",
		Stroke: stroke,
	}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	// Broadcast to all clients
	for _, client := range canvas.Clients {
		select {
		case client.Send <- data:
		default:
			// Drop message if send channel is full
		}
	}
}