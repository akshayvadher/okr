package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"io"
	"log"
	"net/http"
	"okr/internal/broadcast"
	"okr/internal/domain"
	"okr/internal/service"
	"time"
)

type OKRHandler struct {
	service       *service.OKRService
	clientManager *broadcast.ClientManager
}

func NewOKRHandler(service *service.OKRService, clientManager *broadcast.ClientManager) *OKRHandler {
	return &OKRHandler{service: service, clientManager: clientManager}
}

type createObjectiveRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type createKeyResultRequest struct {
	Title   string  `json:"title" binding:"required"`
	Target  float64 `json:"target" binding:"required"`
	Metrics string  `json:"metrics" binding:"required"`
}

type updateProgressRequest struct {
	Progress float64 `json:"progress" binding:"required"`
}

type createTransactionRequest struct {
	Id        string    `json:"id" binding:"required"`
	Action    string    `json:"action" binding:"required"`
	Entity    string    `json:"entity" binding:"required"`
	Payload   string    `json:"payload" binding:"required"`
	CreatedAt time.Time `json:"created_at" binding:"required"`
}

func (h *OKRHandler) CreateObjective(c *gin.Context) {
	var req createObjectiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	obj := &domain.Objective{
		Title:       req.Title,
		Description: req.Description,
	}

	if err := h.service.CreateObjective(c.Request.Context(), obj); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, obj)
}

func (h *OKRHandler) GetObjective(c *gin.Context) {
	id := c.Param("id")

	obj, err := h.service.GetObjective(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, obj)
}

func (h *OKRHandler) ListObjectives(c *gin.Context) {
	objectives, err := h.service.ListObjectives(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, objectives)
}

func (h *OKRHandler) CreateKeyResult(c *gin.Context) {
	objectiveID := c.Param("id")
	objID, err := uuid.Parse(objectiveID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid objective ID"})
		return
	}

	var req createKeyResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	kr := &domain.KeyResult{
		ObjectiveID: objID,
		Title:       req.Title,
		Target:      req.Target,
		Current:     0,
		Metrics:     req.Metrics,
	}

	if err := h.service.CreateKeyResult(c.Request.Context(), kr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, kr)
}

func (h *OKRHandler) UpdateKeyResultProgress(c *gin.Context) {
	id := c.Param("id")

	var req updateProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateKeyResultProgress(c.Request.Context(), id, req.Progress); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "progress updated successfully"})
}

func (h *OKRHandler) GetObjectiveWithKeyResults(c *gin.Context) {
	id := c.Param("id")

	objective, err := h.service.GetObjectiveWithKeyResults(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, objective)
}

func (h *OKRHandler) AddTransaction(c *gin.Context) {
	var req createTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(req)

	t := &domain.Transaction{
		ID:              req.Id,
		CreatedAt:       req.CreatedAt,
		ServerCreatedAt: time.Now(),
		Entity:          req.Entity,
		Action:          req.Action,
		Payload:         req.Payload,
	}

	if err := h.service.AddTransaction(c.Request.Context(), t); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, t)
}

func (h *OKRHandler) ListenEvents_(c *gin.Context) {
	// Set headers for SSE
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// Create a channel for this client
	clientChan := make(chan broadcast.Event)

	// Register the client
	h.clientManager.Register <- clientChan

	// Optional: Filter transactions by entity or action
	entity := c.Query("entity")
	action := c.Query("action")

	// Send initial data
	transactions, err := h.service.GetTransactions(c, entity, action)
	if err == nil {
		fmt.Println("broadcasting initial transactions", transactions)
		clientChan <- broadcast.Event{Type: "initial", Data: transactions}
	}

	// Create a context that gets canceled when client disconnects
	ctx, cancel := context.WithCancel(c.Request.Context())
	defer cancel()

	// Notify of client disconnection
	go func() {
		<-ctx.Done()
		h.clientManager.Unregister <- clientChan
	}()

	// Stream events to client
	c.Stream(func(w io.Writer) bool {
		if msg, ok := <-clientChan; ok {
			fmt.Println("received a message in client", msg)
			data, err := json.Marshal(msg)
			if err != nil {
				log.Printf("Error marshaling event: %v", err)
				return true
			}

			// Write the event to the response
			fmt.Fprintf(w, "data: %s\n\n", data)
			return true
		}
		return false
	})
}

func (h *OKRHandler) ListenEvents(c *gin.Context) {
	// Set headers for SSE
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	// Create a channel for this client
	clientChan := make(chan broadcast.Event)

	h.clientManager.Register <- clientChan

	go func() {
		entity := c.Query("entity")
		action := c.Query("action")

		// Send initial data
		transactions, _ := h.service.GetTransactions(c, entity, action)

		clientChan <- broadcast.Event{
			Type: "initial",
			Data: transactions,
		}
	}()

	// Create a context that gets canceled when client disconnects
	ctx, cancel := context.WithCancel(c.Request.Context())
	defer cancel()

	// Notify of client disconnection
	go func() {
		<-ctx.Done()
		h.clientManager.Unregister <- clientChan
	}()

	// Stream events to client
	c.Stream(func(w io.Writer) bool {
		if msg, ok := <-clientChan; ok {
			fmt.Println("received a message in client", msg)
			data, err := json.Marshal(msg)
			if err != nil {
				log.Printf("Error marshaling event: %v", err)
				return true
			}

			// Write the event to the response
			fmt.Fprintf(w, "data: %s\n\n", data)
			return true
		}
		return false
	})
}
