package main

import (
	"fmt"
	"log"
	"okr/config"
	"okr/internal/broadcast"
	"okr/internal/handler"
	"okr/internal/repository/gorm"
	"okr/internal/service"
	"okr/pkg/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig("./config")
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.NewGormDB(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

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

	go broadcast.MonitorTransactions(&cfg.Database, db, clientManager)

	// Setup router
	r := gin.New()
	r.Use(gin.Recovery())
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
