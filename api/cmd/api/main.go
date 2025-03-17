package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"okr/config"
	"okr/internal/broadcast"
	"okr/internal/handler"
	"okr/internal/repository/gorm"
	"okr/internal/service"
	"okr/pkg/database"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig("./config")
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	db, err := database.NewGormDB(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// GetClientManager the underlying SQL DB and ensure it's closed
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get SQL DB: %v", err)
	}
	defer sqlDB.Close()

	// Initialize repositories, services, and handlers
	repo := gorm.NewGormOKRRepository(db)
	okrService := service.NewOKRService(repo)
	clientManager := broadcast.NewClientManager()
	okrHandler := handler.NewOKRHandler(okrService, clientManager)

	clientManager.Start()

	go broadcast.MonitorTransactions(db, clientManager)

	// Setup router
	r := gin.Default()
	r.Use(cors.Default())

	// Routes
	v1 := r.Group("/api/v1")
	{
		objectives := v1.Group("/objectives")
		{
			objectives.GET("/", okrHandler.ListObjectives)
			objectives.GET("/:id", okrHandler.GetObjective)
			objectives.GET("/:id/details", okrHandler.GetObjectiveWithKeyResults)
		}

		transactions := v1.Group("/transactions")
		{
			transactions.POST("/", okrHandler.AddTransaction)
			transactions.GET("/events", okrHandler.ListenEvents)
		}
		v1.DELETE("/delete-all", okrHandler.DeleteAll)
	}

	// Start server
	serverAddr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Starting server on %s", serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
