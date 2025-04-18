package repository

import (
	"context"
	"okr/internal/domain"
)

type OKRRepository interface {
	CreateObjective(ctx context.Context, obj *domain.Objective) error
	GetObjective(ctx context.Context, id string) (*domain.Objective, error)
	ListObjectives(ctx context.Context) ([]*domain.Objective, error)
	UpdateObjective(ctx context.Context, obj *domain.Objective) error
	CreateKeyResult(ctx context.Context, kr *domain.KeyResult) error
	UpdateKeyResultProgress(ctx context.Context, id string, progress float64) error
	GetObjectiveWithKeyResults(ctx context.Context, id string) (*domain.Objective, error)
	AddTransaction(ctx context.Context, t *domain.Transaction) error
	GetTransactions(ctx context.Context, entity, action, from string) ([]*domain.Transaction, error)
	DeleteAll(ctx context.Context)
	CreateComment(ctx context.Context, comment *domain.Comment) error
	CreateTask(ctx context.Context, task *domain.Task) error
	UpdateTask(ctx context.Context, task *domain.Task) error
	GetTask(ctx context.Context, id string) (*domain.Task, error)
}
