// Package router sets up HTTP routes.
package router

import (
	"net/http"

	"github.com/noa/circle-app/api/adapter/http/handler"
)

// Setup configures all routes.
func Setup(
	circleHandler *handler.CircleHandler,
	eventHandler *handler.EventHandler,
	announcementHandler *handler.AnnouncementHandler,
	rsvpHandler *handler.RSVPHandler,
	settlementHandler *handler.SettlementHandler,
	chatHandler *handler.ChatHandler,
) *http.ServeMux {
	mux := http.NewServeMux()

	// Root: simple message (avoid 404 when opening URL in browser)
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Circle API","health":"/health"}`))
	})
	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Circle routes
	mux.HandleFunc("POST /circles", circleHandler.Create)
	mux.HandleFunc("GET /circles/{circleId}", circleHandler.Get)
	mux.HandleFunc("POST /circles/{circleId}/members", circleHandler.AddMember)
	mux.HandleFunc("GET /circles/{circleId}/members", circleHandler.GetMembers)
	mux.HandleFunc("GET /circles/{circleId}/events", eventHandler.GetByCircle)
	mux.HandleFunc("GET /circles/{circleId}/announcements", announcementHandler.GetByCircle)

	// Event routes
	mux.HandleFunc("POST /events", eventHandler.Create)
	mux.HandleFunc("GET /events/{eventId}", eventHandler.Get)
	mux.HandleFunc("GET /events/{eventId}/announcements", announcementHandler.GetByEvent)
	mux.HandleFunc("POST /events/{eventId}/rsvp", rsvpHandler.Submit)
	mux.HandleFunc("GET /events/{eventId}/rsvp/me", rsvpHandler.GetMy)
	mux.HandleFunc("GET /events/{eventId}/settlements", settlementHandler.GetByEvent)

	// Announcement routes
	mux.HandleFunc("POST /announcements", announcementHandler.Create)

	// Settlement routes
	mux.HandleFunc("POST /settlements", settlementHandler.Create)
	mux.HandleFunc("GET /settlements/me", settlementHandler.GetMy)
	mux.HandleFunc("POST /settlements/{id}/report", settlementHandler.ReportPayment)

	// AI Chat routes
	mux.HandleFunc("POST /ai/chat", chatHandler.Ask)

	return mux
}
