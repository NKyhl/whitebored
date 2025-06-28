package main

import (
	"net/http"

	"github.com/NKyhl/whitebored/backend/internal/handlers"
	"github.com/NKyhl/whitebored/backend/internal/hub"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	hub := hub.NewHub()

	// Health check endpoint
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	// Create new canvas endpoint
	router.POST("/api/canvas", handlers.CreateCanvasHandler(hub))

	// WebSocket route
	router.GET("/ws/:id", handlers.HandleWebSocket(hub))

	router.Run(":8080")
}