package domain

import (
	"time"

	"gorm.io/gorm"
)

// Base model with common fields
type Base struct {
	ID        string    `gorm:"type:varchar(255);primary_key" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (base *Base) BeforeCreate(tx *gorm.DB) error {
	if base.ID == "" {
		panic("blank id")
	}
	return nil
}

// Objective represents a top-level OKR objective
type Objective struct {
	Base
	Title       string      `gorm:"type:varchar(255);not null" json:"title"`
	Description string      `gorm:"type:text" json:"description"`
	KeyResults  []KeyResult `gorm:"foreignKey:ObjectiveID" json:"keyResults"`
	Comments    []Comment   `gorm:"foreignKey:ObjectiveID" json:"comments"`
	Tasks       []Task      `gorm:"foreignKey:ObjectiveID" json:"tasks"`
}

// TableName overrides the table name
func (Objective) TableName() string {
	return "objectives"
}

// KeyResult represents a measurable outcome for an objective
type KeyResult struct {
	Base
	ObjectiveID string  `gorm:"type:varchar(255);not null" json:"objectiveId"`
	Title       string  `gorm:"type:varchar(255);not null" json:"title"`
	Target      float64 `gorm:"not null" json:"target"`
	Current     float64 `gorm:"not null;default:0" json:"current"`
	Metrics     string  `gorm:"not null;default:'%''" json:"metrics"`
}

// TableName overrides the table name
func (KeyResult) TableName() string {
	return "key_results"
}

// Task represents a task associated with an objective or key result
type Task struct {
	Base
	Title       string  `gorm:"type:varchar(255);not null" json:"title"`
	Status      string  `gorm:"type:varchar(20);not null;default:'todo'" json:"status"` // todo, in-progress, done, not-doing
	ObjectiveID *string `gorm:"type:varchar(255)" json:"objectiveId"`
	KeyResultID *string `gorm:"type:varchar(255)" json:"keyResultId"`
}

// TableName overrides the table name
func (Task) TableName() string {
	return "tasks"
}

// Comment represents a comment on an objective or key result
type Comment struct {
	Base
	Content     string  `gorm:"type:text;not null" json:"content"`
	ObjectiveID string  `gorm:"type:varchar(255);not null" json:"objectiveId"`
	KeyResultID *string `gorm:"type:varchar(255)" json:"keyResultId,omitempty"`
}

// TableName overrides the table name
func (Comment) TableName() string {
	return "comments"
}

type Transaction struct {
	ID              string    `gorm:"type:varchar(255);primary_key" json:"id"`
	CreatedAt       time.Time `json:"createdAt"`
	ServerCreatedAt time.Time `gorm:"index" json:"serverCreatedAt"`
	ClientId        string    `gorm:"type:varchar(255)" json:"clientId"`
	SessionId       string    `gorm:"type:varchar(255)" json:"sessionId"`
	Entity          string    `gorm:"type:string;not null" json:"entity"`
	ObjectiveId     string    `gorm:"type:varchar(255)" json:"objectiveId"`
	Action          string    `gorm:"type:string;not null" json:"action"`
	Payload         string    `gorm:"type:json;not null" json:"payload"`
}

func (Transaction) TableName() string {
	return "transactions"
}
