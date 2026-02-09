package usecase

import (
	"context"
	"time"

	"github.com/noa/circle-app/api/domain"
	"github.com/noa/circle-app/api/usecase/port"
)

// EventInteractor handles event-related business logic.
type EventInteractor struct {
	eventRepo port.EventRepository
}

// NewEventInteractor creates a new EventInteractor.
func NewEventInteractor(eventRepo port.EventRepository) *EventInteractor {
	return &EventInteractor{eventRepo: eventRepo}
}

// CreateEvent creates a new event.
func (i *EventInteractor) CreateEvent(ctx context.Context, circleID, title string, startAt time.Time, location, coverImageURL string, rsvpTargetUserIDs []string, createdBy string) (*domain.Event, error) {
	event := &domain.Event{
		CircleID:          circleID,
		Title:             title,
		StartAt:           startAt,
		Location:          location,
		CoverImageURL:     coverImageURL,
		RSVPTargetUserIDs: rsvpTargetUserIDs,
		CreatedBy:         createdBy,
		CreatedAt:         time.Now(),
	}
	if err := i.eventRepo.Create(ctx, event); err != nil {
		return nil, err
	}
	return event, nil
}

// GetEvent returns an event by ID.
func (i *EventInteractor) GetEvent(ctx context.Context, id string) (*domain.Event, error) {
	return i.eventRepo.GetByID(ctx, id)
}

// GetEventsByCircle returns all events for a circle.
func (i *EventInteractor) GetEventsByCircle(ctx context.Context, circleID string) ([]*domain.Event, error) {
	return i.eventRepo.GetByCircle(ctx, circleID)
}
