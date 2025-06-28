package main

import (
	"fmt"
	"os"

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

	// Select port
	port := os.Getenv("BACKEND_PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(fmt.Sprintf(":%s", port))
}