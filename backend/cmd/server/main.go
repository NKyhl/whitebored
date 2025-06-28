package main

import (
	"github.com/NKyhl/whitebored/backend/internal/handlers"
	"github.com/NKyhl/whitebored/backend/internal/hub"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	hub := hub.New()

	// Health check endpoint
	router.GET("/api/health", handlers.HealthCheck())

	// Create new canvas endpoint
	router.POST("/api/canvas", handlers.NewCanvas(hub))

	// WebSocket route
	router.GET("/ws/:id", handlers.WebSocket(hub))

	router.Run(":8080")
}