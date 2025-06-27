package main

import (
	"net/http"

	"github.com/NKyhl/whitebored/backend/internal/hub"
	"github.com/NKyhl/whitebored/backend/internal/ws"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	hub := hub.NewHub()

	// Health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	// WebSocket route
	router.GET("/ws/:id", ws.HandleWebSocket(hub))

	router.Run(":8080")
}