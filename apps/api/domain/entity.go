// Package domain contains core business entities.
// This layer has ZERO external dependencies.
package domain

import (
	"time"
)

// User represents a user.
type User struct {
	ID        string    `json:"id" firestore:"id"`
	Name      string    `json:"name" firestore:"name"`
	AvatarURL string    `json:"avatarUrl" firestore:"avatarUrl"`
	CreatedAt time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" firestore:"updatedAt"`
}

// Circle represents a circle group.
type Circle struct {
	ID          string    `json:"id" firestore:"id"`
	Name        string    `json:"name" firestore:"name"`
	Description string    `json:"description" firestore:"description"`
	LogoURL     string    `json:"logoUrl" firestore:"logoUrl"`
	CreatedAt   time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" firestore:"updatedAt"`
}

// MemberRole represents a member's role in a circle.
type MemberRole string

const (
	RoleAdmin  MemberRole = "ADMIN"
	RoleMember MemberRole = "MEMBER"
)

// Membership represents a user's membership in a circle.
type Membership struct {
	ID       string     `json:"id" firestore:"id"`
	CircleID string     `json:"circleId" firestore:"circleId"`
	UserID   string     `json:"userId" firestore:"userId"`
	Role     MemberRole `json:"role" firestore:"role"`
	JoinedAt time.Time  `json:"joinedAt" firestore:"joinedAt"`
}

// Event represents an event in a circle.
type Event struct {
	ID                string    `json:"id" firestore:"id"`
	CircleID          string    `json:"circleId" firestore:"circleId"`
	Title             string    `json:"title" firestore:"title"`
	StartAt           time.Time `json:"startAt" firestore:"startAt"`
	Location          string    `json:"location" firestore:"location"`
	CoverImageURL     string    `json:"coverImageUrl" firestore:"coverImageUrl"`
	RSVPTargetUserIDs []string  `json:"rsvpTargetUserIds" firestore:"rsvpTargetUserIds"`
	CreatedBy         string    `json:"createdBy" firestore:"createdBy"`
	CreatedAt         time.Time `json:"createdAt" firestore:"createdAt"`
}

// Announcement represents an announcement for an event.
type Announcement struct {
	ID        string    `json:"id" firestore:"id"`
	CircleID  string    `json:"circleId" firestore:"circleId"`
	EventID   string    `json:"eventId" firestore:"eventId"`
	Title     string    `json:"title" firestore:"title"`
	Body      string    `json:"body" firestore:"body"`
	CreatedBy string    `json:"createdBy" firestore:"createdBy"`
	CreatedAt time.Time `json:"createdAt" firestore:"createdAt"`
}

// RSVPStatus represents RSVP status.
type RSVPStatus string

const (
	RSVPGo    RSVPStatus = "GO"
	RSVPNo    RSVPStatus = "NO"
	RSVPLate  RSVPStatus = "LATE"
	RSVPEarly RSVPStatus = "EARLY"
)

// RSVP represents a user's RSVP for an event.
type RSVP struct {
	ID        string     `json:"id" firestore:"id"`
	EventID   string     `json:"eventId" firestore:"eventId"`
	UserID    string     `json:"userId" firestore:"userId"`
	Status    RSVPStatus `json:"status" firestore:"status"`
	Note      string     `json:"note" firestore:"note"`
	UpdatedAt time.Time  `json:"updatedAt" firestore:"updatedAt"`
}

// Settlement represents a payment request.
type Settlement struct {
	ID            string    `json:"id" firestore:"id"`
	CircleID      string    `json:"circleId" firestore:"circleId"`
	EventID       string    `json:"eventId" firestore:"eventId"`
	Title         string    `json:"title" firestore:"title"`
	Amount        int       `json:"amount" firestore:"amount"`
	DueAt         time.Time `json:"dueAt" firestore:"dueAt"`
	TargetUserIDs []string  `json:"targetUserIds" firestore:"targetUserIds"`
	BankInfo      string    `json:"bankInfo" firestore:"bankInfo"`
	PayPayInfo    string    `json:"paypayInfo" firestore:"paypayInfo"`
	CreatedAt     time.Time `json:"createdAt" firestore:"createdAt"`
}

// PaymentStatus represents payment status.
type PaymentStatus string

const (
	PaymentUnpaid       PaymentStatus = "UNPAID"
	PaymentPaidReported PaymentStatus = "PAID_REPORTED"
	PaymentConfirmed    PaymentStatus = "CONFIRMED"
)

// PaymentMethod represents payment method.
type PaymentMethod string

const (
	PaymentMethodBank   PaymentMethod = "BANK"
	PaymentMethodPayPay PaymentMethod = "PAYPAY"
)

// Payment represents individual user's payment for a settlement.
type Payment struct {
	ID           string        `json:"id" firestore:"id"`
	SettlementID string        `json:"settlementId" firestore:"settlementId"`
	UserID       string        `json:"userId" firestore:"userId"`
	Status       PaymentStatus `json:"status" firestore:"status"`
	Method       PaymentMethod `json:"method" firestore:"method"`
	Note         string        `json:"note" firestore:"note"`
	ReportedAt   time.Time     `json:"reportedAt" firestore:"reportedAt"`
}

// ChatReference represents a referenced announcement in chat.
type ChatReference struct {
	Title   string `json:"title"`
	EventID string `json:"eventId,omitempty"`
}

// ChatResponse represents AI chat response.
type ChatResponse struct {
	AssistantMessage string          `json:"assistantMessage"`
	References       []ChatReference `json:"references"`
}
