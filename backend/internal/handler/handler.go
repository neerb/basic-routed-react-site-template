// Package handler provides HTTP request handlers for the shop API.
package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"shop/internal/domain"
	"shop/internal/service"
)

// Handler holds service dependencies shared by all route handlers.
type Handler struct {
	products *service.ProductService
	carts    *service.CartService
	orders   *service.OrderService
	log      *slog.Logger
}

// NewHandler creates a Handler.
func NewHandler(
	products *service.ProductService,
	carts *service.CartService,
	orders *service.OrderService,
	log *slog.Logger,
) *Handler {
	return &Handler{
		products: products,
		carts:    carts,
		orders:   orders,
		log:      log,
	}
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

// writeJSON encodes v as JSON and writes it with the supplied status code.
func (h *Handler) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		h.log.Error("encode JSON response", "err", err)
	}
}

// writeError writes a JSON { "message": "..." } error response.
func (h *Handler) writeError(w http.ResponseWriter, status int, message string) {
	h.writeJSON(w, status, map[string]string{"message": message})
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

// readSessionID extracts the X-Session-ID header, responding 400 if absent.
func (h *Handler) readSessionID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id := r.Header.Get("X-Session-ID")
	if id == "" {
		h.writeError(w, http.StatusBadRequest, "X-Session-ID header is required")
		return "", false
	}
	return id, true
}

// mapDomainError converts a well-known domain sentinel error to an HTTP status.
func (h *Handler) mapDomainError(err error) int {
	switch {
	case errors.Is(err, domain.ErrProductNotFound),
		errors.Is(err, domain.ErrOrderNotFound),
		errors.Is(err, domain.ErrCartItemNotFound):
		return http.StatusNotFound
	case errors.Is(err, domain.ErrInsufficientStock):
		return http.StatusConflict
	case errors.Is(err, domain.ErrCartEmpty):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

// ---------------------------------------------------------------------------
// CORS middleware
// ---------------------------------------------------------------------------

// corsMiddleware adds CORS headers so the Vite dev server (port 5173) can
// call the API directly.  In production, configure your reverse proxy instead.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Session-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
