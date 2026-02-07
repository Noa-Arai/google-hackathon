// Package port defines repository and service interfaces.
// Part of usecase layer - no external dependencies.
package port

import (
	"context"

	"github.com/noa/circle-app/api/domain"
)

// UserRepository defines user data access interface.
type UserRepository interface {
	GetByID(ctx context.Context, id string) (*domain.User, error)
}

// CircleRepository defines circle data access interface.
type CircleRepository interface {
	Create(ctx context.Context, c *domain.Circle) error
	GetByID(ctx context.Context, id string) (*domain.Circle, error)
}

// MembershipRepository defines membership data access interface.
type MembershipRepository interface {
	Create(ctx context.Context, m *domain.Membership) error
	GetByCircle(ctx context.Context, circleID string) ([]*domain.Membership, error)
	GetByCircleAndUser(ctx context.Context, circleID, userID string) (*domain.Membership, error)
}

// EventRepository defines event data access interface.
type EventRepository interface {
	Create(ctx context.Context, e *domain.Event) error
	GetByID(ctx context.Context, id string) (*domain.Event, error)
	GetByCircle(ctx context.Context, circleID string) ([]*domain.Event, error)
}

// AnnouncementRepository defines announcement data access interface.
type AnnouncementRepository interface {
	Create(ctx context.Context, a *domain.Announcement) error
	GetByEvent(ctx context.Context, eventID string) ([]*domain.Announcement, error)
	GetByCircle(ctx context.Context, circleID string, limit int) ([]*domain.Announcement, error)
}

// RSVPRepository defines RSVP data access interface.
type RSVPRepository interface {
	Upsert(ctx context.Context, r *domain.RSVP) error
	GetByEventAndUser(ctx context.Context, eventID, userID string) (*domain.RSVP, error)
}

// SettlementRepository defines settlement data access interface.
type SettlementRepository interface {
	Create(ctx context.Context, s *domain.Settlement) error
	GetByID(ctx context.Context, id string) (*domain.Settlement, error)
	GetByEvent(ctx context.Context, eventID string) ([]*domain.Settlement, error)
}

// PaymentRepository defines payment data access interface.
type PaymentRepository interface {
	Create(ctx context.Context, p *domain.Payment) error
	GetBySettlementAndUser(ctx context.Context, settlementID, userID string) (*domain.Payment, error)
	GetByUser(ctx context.Context, userID string) ([]*domain.Payment, error)
	Update(ctx context.Context, p *domain.Payment) error
}

// AIService defines AI chat service interface.
type AIService interface {
	GenerateResponse(ctx context.Context, message string, announcements []*domain.Announcement) (*domain.ChatResponse, error)
}
