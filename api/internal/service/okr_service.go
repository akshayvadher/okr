package service

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"okr/internal/domain"
	"okr/internal/dto"
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
	err := s.repo.AddTransaction(ctx, t)
	if err != nil {
		return err
	}
	switch t.Entity {
	case "OBJECTIVE":
		switch t.Action {
		case "CREATE":
			var createObjectiveRequest dto.CreateObjectiveRequest
			err := json.Unmarshal([]byte(t.Payload), &createObjectiveRequest)
			if err != nil {
				return err
			}
			obj := &domain.Objective{
				Base: domain.Base{
					ID:        t.ID,
					CreatedAt: t.CreatedAt,
					UpdatedAt: t.CreatedAt,
				},
				Title:       createObjectiveRequest.Title,
				Description: createObjectiveRequest.Description,
			}
			err = s.CreateObjective(ctx, obj)
			if err != nil {
				return err
			}
		case "UPDATE":
			var updateObjectiveRequest dto.UpdateObjectiveRequest
			err := json.Unmarshal([]byte(t.Payload), &updateObjectiveRequest)
			if err != nil {
				return err
			}
			err = s.UpdateObjective(ctx, &updateObjectiveRequest)
			if err != nil {
				return err
			}
		}
	case "KEY_RESULT":
		switch t.Action {
		case "CREATE":
			var createKeyResultRequest dto.CreateKeyResultRequest
			err := json.Unmarshal([]byte(t.Payload), &createKeyResultRequest)
			if err != nil {
				return err
			}
			kr := &domain.KeyResult{
				Base: domain.Base{
					ID:        t.ID,
					CreatedAt: t.CreatedAt,
					UpdatedAt: t.CreatedAt,
				},
				ObjectiveID: createKeyResultRequest.ObjectiveId,
				Title:       createKeyResultRequest.Title,
				Target:      createKeyResultRequest.Target,
				Current:     0,
				Metrics:     createKeyResultRequest.Metrics,
			}
			err = s.CreateKeyResult(ctx, kr)
			if err != nil {
				return err
			}
		case "UPDATE_PROGRESS":
			var updateProgressRequest dto.UpdateProgressRequest
			err := json.Unmarshal([]byte(t.Payload), &updateProgressRequest)
			if err != nil {
				return err
			}
			err = s.UpdateKeyResultProgress(ctx, updateProgressRequest.KeyResultId, updateProgressRequest.Progress)
			if err != nil {
				return err
			}
		}
	case "COMMENT":
		switch t.Action {
		case "CREATE":
			var createCommentRequest dto.CreateCommentRequest
			err := json.Unmarshal([]byte(t.Payload), &createCommentRequest)
			if err != nil {
				return err
			}
			comment := &domain.Comment{
				Base: domain.Base{
					ID:        t.ID,
					CreatedAt: t.CreatedAt,
					UpdatedAt: t.CreatedAt,
				},
				ObjectiveID: createCommentRequest.ObjectiveId,
				KeyResultID: createCommentRequest.KeyResultId,
				Content:     createCommentRequest.Content,
			}
			err = s.CreateComment(ctx, comment)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *OKRService) GetTransactions(c context.Context, entity, action, from string) ([]*domain.Transaction, error) {
	return s.repo.GetTransactions(c, entity, action, from)
}

func (s *OKRService) DeleteAll(c *gin.Context) {
	s.repo.DeleteAll(c)
}

func (s *OKRService) CreateComment(ctx context.Context, comment *domain.Comment) error {
	if comment.Content == "" {
		return errors.New("comment content cannot be empty")
	}

	_, err := s.repo.GetObjective(ctx, comment.ObjectiveID)
	if err != nil {
		return err
	}

	return s.repo.CreateComment(ctx, comment)
}

func (s *OKRService) UpdateObjective(ctx context.Context, request *dto.UpdateObjectiveRequest) error {
	existing, err := s.repo.GetObjective(ctx, request.ID)
	if err != nil {
		return err
	}

	// Only update fields that are provided
	if request.Title != nil {
		existing.Title = *request.Title
	}
	if request.Description != nil {
		existing.Description = *request.Description
	}

	return s.repo.UpdateObjective(ctx, existing)
}
