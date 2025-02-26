package repository

import (
	"context"
	"okr/internal/domain"
)

type OKRRepository interface {
	CreateObjective(ctx context.Context, obj *domain.Objective) error
	GetObjective(ctx context.Context, id string) (*domain.Objective, error)
	ListObjectives(ctx context.Context) ([]*domain.Objective, error)
	CreateKeyResult(ctx context.Context, kr *domain.KeyResult) error
	UpdateKeyResultProgress(ctx context.Context, id string, progress float64) error
	GetObjectiveWithKeyResults(ctx context.Context, id string) (*domain.Objective, error)
}
