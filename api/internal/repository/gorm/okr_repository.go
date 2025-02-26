package gorm

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"okr/internal/domain"
)

type OKRRepository struct {
	db *gorm.DB
}

func NewGormOKRRepository(db *gorm.DB) *OKRRepository {
	return &OKRRepository{db: db}
}

func (r *OKRRepository) CreateObjective(ctx context.Context, obj *domain.Objective) error {
	return r.db.WithContext(ctx).Create(obj).Error
}

func (r *OKRRepository) GetObjective(ctx context.Context, id string) (*domain.Objective, error) {
	objID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}

	var objective domain.Objective
	if err := r.db.WithContext(ctx).First(&objective, "id = ?", objID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("objective not found")
		}
		return nil, err
	}

	return &objective, nil
}

func (r *OKRRepository) ListObjectives(ctx context.Context) ([]*domain.Objective, error) {
	var objectives []*domain.Objective
	if err := r.db.WithContext(ctx).Preload("KeyResults").Order("created_at desc").Find(&objectives).Error; err != nil {
		return nil, err
	}

	return objectives, nil
}

func (r *OKRRepository) CreateKeyResult(ctx context.Context, kr *domain.KeyResult) error {
	return r.db.WithContext(ctx).Create(kr).Error
}

func (r *OKRRepository) UpdateKeyResultProgress(ctx context.Context, id string, progress float64) error {
	krID, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	result := r.db.WithContext(ctx).Model(&domain.KeyResult{}).
		Where("id = ?", krID).
		Update("current", progress)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("key result not found")
	}

	return nil
}

func (r *OKRRepository) GetObjectiveWithKeyResults(ctx context.Context, id string) (*domain.Objective, error) {
	objID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}

	var objective domain.Objective
	if err := r.db.WithContext(ctx).Preload("KeyResults").First(&objective, "id = ?", objID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("objective not found")
		}
		return nil, err
	}

	return &objective, nil
}
