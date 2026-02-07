package usecase

import (
	"context"

	"github.com/noa/circle-app/api/domain"
	"github.com/noa/circle-app/api/usecase/port"
)

// ChatInteractor handles AI chat business logic.
type ChatInteractor struct {
	announcementRepo port.AnnouncementRepository
	aiService        port.AIService
}

// NewChatInteractor creates a new ChatInteractor.
func NewChatInteractor(announcementRepo port.AnnouncementRepository, aiService port.AIService) *ChatInteractor {
	return &ChatInteractor{
		announcementRepo: announcementRepo,
		aiService:        aiService,
	}
}

// Ask processes a user question using circle's announcements as context.
func (i *ChatInteractor) Ask(ctx context.Context, circleID, message string) (*domain.ChatResponse, error) {
	// Get latest announcements for context (max 10)
	announcements, err := i.announcementRepo.GetByCircle(ctx, circleID, 10)
	if err != nil {
		return nil, err
	}

	// Generate AI response
	return i.aiService.GenerateResponse(ctx, message, announcements)
}
