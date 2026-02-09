// Package gemini provides Gemini AI service implementation.
package gemini

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/noa/circle-app/api/domain"
	"google.golang.org/api/option"
)

// AIService implements port.AIService using Gemini API.
type AIService struct {
	apiKey string
}

// NewAIService creates a new Gemini AI service.
func NewAIService(apiKey string) *AIService {
	return &AIService{apiKey: apiKey}
}

// GenerateResponse generates an AI response based on announcements.
func (s *AIService) GenerateResponse(ctx context.Context, message string, announcements []*domain.Announcement) (*domain.ChatResponse, error) {
	if s.apiKey == "" {
		return &domain.ChatResponse{
			AssistantMessage: "AIサービスが設定されていません（GEMINI_API_KEY未設定）",
			References:       nil,
		}, nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(s.apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	// Build context from announcements
	var contextParts []string
	var references []domain.ChatReference
	for _, a := range announcements {
		contextParts = append(contextParts, fmt.Sprintf(
			"【%s】\n%s",
			a.Title,
			a.Body,
		))
		references = append(references, domain.ChatReference{
			Title:   a.Title,
			EventID: a.EventID,
		})
	}

	announcementContext := strings.Join(contextParts, "\n\n---\n\n")

	prompt := fmt.Sprintf(`あなたはサークルのお知らせを参照して質問に回答するAIアシスタントです。
以下のお知らせ情報のみを参照して回答してください。
重要: 個人情報、出欠情報、支払い情報は参照しないでください。お知らせの内容のみを参照してください。
お知らせに含まれない情報については「お知らせに記載がありません」と答えてください。
回答には必ず参照したお知らせのタイトルを明記してください。

## お知らせ情報
%s

## 質問
%s

## 回答`, announcementContext, message)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	var answer string
	for _, candidate := range resp.Candidates {
		if candidate.Content != nil {
			for _, part := range candidate.Content.Parts {
				if text, ok := part.(genai.Text); ok {
					answer += string(text)
				}
			}
		}
	}

	return &domain.ChatResponse{
		AssistantMessage: answer,
		References:       references,
	}, nil
}
