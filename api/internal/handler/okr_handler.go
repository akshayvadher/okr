package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"net/http"
	"okr/internal/broadcast"
	"okr/internal/domain"
	"okr/internal/dto"
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

func (h *OKRHandler) CreateObjective(c *gin.Context) {
	var req dto.CreateObjectiveRequest
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

	var req dto.CreateKeyResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	kr := &domain.KeyResult{
		ObjectiveID: objectiveID,
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

	var req dto.UpdateProgressRequest
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
	var req dto.CreateTransactionRequest
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
		from := c.Query("from")

		// Send initial data
		transactions, _ := h.service.GetTransactions(c, entity, action, from)

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

func (h *OKRHandler) DeleteAll(c *gin.Context) {
	h.service.DeleteAll(c)
	c.JSON(http.StatusOK, "ok")
}
