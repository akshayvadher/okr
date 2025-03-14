package service

import (
	"context"
	"errors"
	"github.com/gin-gonic/gin"
	"okr/internal/domain"
	"okr/internal/repository"
)

type OKRService struct {
	repo repository.OKRRepository
}

func NewOKRService(repo repository.OKRRepository) *OKRService {
	return &OKRService{repo: repo}
}

func (s *OKRService) CreateObjective(ctx context.Context, obj *domain.Objective) error {
	if obj.Title == "" {
		return errors.New("objective title cannot be empty")
	}

	return s.repo.CreateObjective(ctx, obj)
}

func (s *OKRService) GetObjective(ctx context.Context, id string) (*domain.Objective, error) {
	return s.repo.GetObjective(ctx, id)
}

func (s *OKRService) ListObjectives(ctx context.Context) ([]*domain.Objective, error) {
	return s.repo.ListObjectives(ctx)
}

func (s *OKRService) CreateKeyResult(ctx context.Context, kr *domain.KeyResult) error {
	if kr.Title == "" {
		return errors.New("key result title cannot be empty")
	}

	if kr.Target <= 0 {
		return errors.New("target must be greater than zero")
	}

	// Verify objective exists
	_, err := s.repo.GetObjective(ctx, kr.ObjectiveID)
	if err != nil {
		return err
	}

	return s.repo.CreateKeyResult(ctx, kr)
}

func (s *OKRService) UpdateKeyResultProgress(ctx context.Context, id string, progress float64) error {
	if progress < 0 {
		return errors.New("progress cannot be negative")
	}

	return s.repo.UpdateKeyResultProgress(ctx, id, progress)
}

func (s *OKRService) GetObjectiveWithKeyResults(ctx context.Context, id string) (*domain.Objective, error) {
	return s.repo.GetObjectiveWithKeyResults(ctx, id)
}

func (s *OKRService) AddTransaction(ctx context.Context, t *domain.Transaction) error {
	return s.repo.AddTransaction(ctx, t)
}

func (s *OKRService) GetTransactions(c context.Context, entity string, action string) ([]*domain.Transaction, error) {
	return s.repo.GetTransactions(c, entity, action)
}

func (s *OKRService) DeleteAll(c *gin.Context) {
	s.repo.DeleteAll(c)
}
