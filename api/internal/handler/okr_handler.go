package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"okr/internal/domain"
	"okr/internal/service"
)

type OKRHandler struct {
	service *service.OKRService
}

func NewOKRHandler(service *service.OKRService) *OKRHandler {
	return &OKRHandler{service: service}
}

type createObjectiveRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	//StartDate   time.Time `json:"start_date" binding:"required"`
	//EndDate     time.Time `json:"end_date" binding:"required"`
}

type createKeyResultRequest struct {
	Title  string  `json:"title" binding:"required"`
	Target float64 `json:"target" binding:"required"`
}

type updateProgressRequest struct {
	Progress float64 `json:"progress" binding:"required"`
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
		//StartDate:   req.StartDate,
		//EndDate:     req.EndDate,
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
