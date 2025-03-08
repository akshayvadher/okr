package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base model with common fields
type Base struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (base *Base) BeforeCreate(tx *gorm.DB) error {
	if base.ID == uuid.Nil {
		base.ID = uuid.New()
	}
	return nil
}

// Objective represents a top-level OKR objective
type Objective struct {
	Base
	Title       string      `gorm:"type:varchar(255);not null" json:"title"`
	Description string      `gorm:"type:text" json:"description"`
	KeyResults  []KeyResult `gorm:"foreignKey:ObjectiveID" json:"key_results,omitempty"`
}

// TableName overrides the table name
func (Objective) TableName() string {
	return "objectives"
}

// KeyResult represents a measurable outcome for an objective
type KeyResult struct {
	Base
	ObjectiveID uuid.UUID `gorm:"type:uuid;not null" json:"objective_id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Target      float64   `gorm:"not null" json:"target"`
	Current     float64   `gorm:"not null;default:0" json:"current"`
	Metrics     string    `gorm:"not null;default:'%''" json:"metrics"`
}

// TableName overrides the table name
func (KeyResult) TableName() string {
	return "key_results"
}

type Transaction struct {
	ID              string    `gorm:"type:uuid;primary_key" json:"id"`
	CreatedAt       time.Time `json:"created_at"`
	ServerCreatedAt time.Time `json:"server_created_at"`
	Entity          string    `gorm:"type:string;not null" json:"entity"`
	Action          string    `gorm:"type:string;not null" json:"action"`
	Payload         string    `gorm:"type:json;not null" json:"payload"`
}

func (Transaction) TableName() string {
	return "transactions"
}
