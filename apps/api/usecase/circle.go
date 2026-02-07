package usecase

import (
	"context"
	"time"

	"github.com/noa/circle-app/api/domain"
	"github.com/noa/circle-app/api/usecase/port"
)

// CircleInteractor handles circle-related business logic.
type CircleInteractor struct {
	circleRepo     port.CircleRepository
	membershipRepo port.MembershipRepository
}

// NewCircleInteractor creates a new CircleInteractor.
func NewCircleInteractor(circleRepo port.CircleRepository, membershipRepo port.MembershipRepository) *CircleInteractor {
	return &CircleInteractor{
		circleRepo:     circleRepo,
		membershipRepo: membershipRepo,
	}
}

// CreateCircle creates a new circle.
func (i *CircleInteractor) CreateCircle(ctx context.Context, name, description, logoURL string) (*domain.Circle, error) {
	circle := &domain.Circle{
		Name:        name,
		Description: description,
		LogoURL:     logoURL,
		CreatedAt:   time.Now(),
	}
	if err := i.circleRepo.Create(ctx, circle); err != nil {
		return nil, err
	}
	return circle, nil
}

// GetCircle returns a circle by ID.
func (i *CircleInteractor) GetCircle(ctx context.Context, id string) (*domain.Circle, error) {
	return i.circleRepo.GetByID(ctx, id)
}

// AddMember adds a member to a circle.
func (i *CircleInteractor) AddMember(ctx context.Context, circleID, userID string, role domain.MemberRole) (*domain.Membership, error) {
	membership := &domain.Membership{
		CircleID: circleID,
		UserID:   userID,
		Role:     role,
		JoinedAt: time.Now(),
	}
	if err := i.membershipRepo.Create(ctx, membership); err != nil {
		return nil, err
	}
	return membership, nil
}

// GetMembers returns all members of a circle.
func (i *CircleInteractor) GetMembers(ctx context.Context, circleID string) ([]*domain.Membership, error) {
	return i.membershipRepo.GetByCircle(ctx, circleID)
}
