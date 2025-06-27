package hub

import (
	"sync"
)

type Client struct {
	ID		string
	Send	chan []byte
	Canvas	string
}

type Hub struct {
	Canvases map[string]map[string]*Client
	mu 		sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Canvases: make(map[string]map[string]*Client),
	}
}

func (h *Hub) AddClient(canvasID string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.Canvases[canvasID] == nil {
		h.Canvases[canvasID] = make(map[string]*Client)
	}

	h.Canvases[canvasID][client.ID] = client
}

func (h *Hub) RemoveClient(canvasID, clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if clients, ok := h.Canvases[canvasID]; ok {
		delete(clients, clientID)
		if len(clients) == 0 {
			delete(h.Canvases, canvasID) // Clean up empty canvas
		}
	}
}

func (h *Hub) Broadcast(canvasID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.Canvases[canvasID] {
		client.Send <- message
	}
}