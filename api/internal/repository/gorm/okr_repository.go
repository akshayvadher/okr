package gorm

import (
	"context"
	"errors"
	"gorm.io/gorm"
	"time"

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
	var objective domain.Objective
	if err := r.db.WithContext(ctx).First(&objective, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("objective not found")
		}
		return nil, err
	}

	return &objective, nil
}

func (r *OKRRepository) ListObjectives(ctx context.Context) ([]*domain.Objective, error) {
	var objectives []*domain.Objective
	if err := r.db.WithContext(ctx).Preload("KeyResults").Preload("Comments").Preload("Tasks").Order("created_at desc").Find(&objectives).Error; err != nil {
		return nil, err
	}

	return objectives, nil
}

func (r *OKRRepository) CreateKeyResult(ctx context.Context, kr *domain.KeyResult) error {
	return r.db.WithContext(ctx).Create(kr).Error
}

func (r *OKRRepository) UpdateKeyResultProgress(ctx context.Context, id string, progress float64) error {
	result := r.db.WithContext(ctx).Model(&domain.KeyResult{}).
		Where("id = ?", id).
		Update("current", progress).
		Update("updated_at", time.Now())

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("key result not found")
	}

	return nil
}

func (r *OKRRepository) GetObjectiveWithKeyResults(ctx context.Context, id string) (*domain.Objective, error) {
	var objective domain.Objective
	if err := r.db.WithContext(ctx).Preload("KeyResults").First(&objective, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("objective not found")
		}
		return nil, err
	}

	return &objective, nil
}

func (r *OKRRepository) AddTransaction(ctx context.Context, t *domain.Transaction) error {
	return r.db.WithContext(ctx).Create(t).Error
}

func (r *OKRRepository) GetTransactions(ctx context.Context, entity, action, from string) ([]*domain.Transaction, error) {
	var transactions []*domain.Transaction
	query := r.db.WithContext(ctx).Model(&domain.Transaction{}).Order("server_created_at ASC")

	if entity != "" {
		query = query.Where("entity = ?", entity)
	}
	if action != "" {
		query = query.Where("action = ?", action)
	}
	if from != "" {
		query = query.Where("server_created_at > ?", from)
	}

	result := query.Find(&transactions)
	if result.Error != nil {
		return nil, result.Error
	}

	return transactions, nil
}

func (r *OKRRepository) DeleteAll(ctx context.Context) {
	r.db.WithContext(ctx).Unscoped().Where("1 = 1").Delete(&domain.Transaction{})
	r.db.WithContext(ctx).Unscoped().Where("1 = 1").Delete(&domain.KeyResult{})
	r.db.WithContext(ctx).Unscoped().Where("1 = 1").Delete(&domain.Comment{})
	r.db.WithContext(ctx).Unscoped().Where("1 = 1").Delete(&domain.Objective{})
}

func (r *OKRRepository) CreateComment(ctx context.Context, comment *domain.Comment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *OKRRepository) UpdateObjective(ctx context.Context, obj *domain.Objective) error {
	return r.db.WithContext(ctx).Save(obj).Error
}

func (r *OKRRepository) CreateTask(ctx context.Context, task *domain.Task) error {
	return r.db.WithContext(ctx).Create(task).Error
}

func (r *OKRRepository) UpdateTask(ctx context.Context, task *domain.Task) error {
	return r.db.WithContext(ctx).Save(task).Error
}

func (r *OKRRepository) GetTask(ctx context.Context, id string) (*domain.Task, error) {
	var task domain.Task
	if err := r.db.WithContext(ctx).First(&task, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("task not found")
		}
		return nil, err
	}

	return &task, nil
}
