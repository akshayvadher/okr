package dto

import "time"

type CreateObjectiveRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type CreateKeyResultRequest struct {
	Title       string  `json:"title" binding:"required"`
	Target      float64 `json:"target" binding:"required"`
	Metrics     string  `json:"metrics" binding:"required"`
	ObjectiveId string  `json:"objectiveId" binding:"required"`
}

type UpdateProgressRequest struct {
	Progress    float64 `json:"progress" binding:"required"`
	KeyResultId string  `json:"keyResultId" binding:"required"`
}

type CreateTransactionRequest struct {
	Id          string    `json:"id" binding:"required"`
	Action      string    `json:"action" binding:"required"`
	Entity      string    `json:"entity" binding:"required"`
	Payload     string    `json:"payload" binding:"required"`
	CreatedAt   time.Time `json:"createdAt" binding:"required"`
	ClientId    string    `json:"clientId" binding:"required"`
	SessionId   string    `json:"sessionId" binding:"required"`
	ObjectiveId string    `json:"objectiveId" binding:"required"`
}
