package usecase

import (
	"context"
	"time"

	"github.com/noa/circle-app/api/domain"
	"github.com/noa/circle-app/api/usecase/port"
)

// RSVPInteractor handles RSVP-related business logic.
type RSVPInteractor struct {
	rsvpRepo  port.RSVPRepository
	eventRepo port.EventRepository
}

// NewRSVPInteractor creates a new RSVPInteractor.
func NewRSVPInteractor(rsvpRepo port.RSVPRepository, eventRepo port.EventRepository) *RSVPInteractor {
	return &RSVPInteractor{
		rsvpRepo:  rsvpRepo,
		eventRepo: eventRepo,
	}
}

// isTargetUser checks if user is in target list.
func isTargetUser(userID string, targetUserIDs []string) bool {
	for _, id := range targetUserIDs {
		if id == userID {
			return true
		}
	}
	return false
}

// SubmitRSVP submits or updates RSVP.
func (i *RSVPInteractor) SubmitRSVP(ctx context.Context, eventID, userID string, status domain.RSVPStatus, note string) (*domain.RSVP, error) {
	// Check if user is target
	event, err := i.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return nil, err
	}

	if !isTargetUser(userID, event.RSVPTargetUserIDs) {
		return nil, domain.ErrForbidden
	}

	rsvp := &domain.RSVP{
		EventID:   eventID,
		UserID:    userID,
		Status:    status,
		Note:      note,
		UpdatedAt: time.Now(),
	}

	if err := i.rsvpRepo.Upsert(ctx, rsvp); err != nil {
		return nil, err
	}

	return rsvp, nil
}

// GetMyRSVP returns user's RSVP for an event.
func (i *RSVPInteractor) GetMyRSVP(ctx context.Context, eventID, userID string) (*domain.RSVP, error) {
	// Check if user is target
	event, err := i.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return nil, err
	}

	if !isTargetUser(userID, event.RSVPTargetUserIDs) {
		return nil, domain.ErrForbidden
	}

	return i.rsvpRepo.GetByEventAndUser(ctx, eventID, userID)
}
