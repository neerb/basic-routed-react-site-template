package handler

import (
	"encoding/json"
	"net/http"

	"shop/internal/domain"
)

// createOrderRequest is the body for POST /api/orders.
type createOrderRequest struct {
	Shipping domain.ShippingAddress `json:"shipping"`
}

// createOrder handles POST /api/orders
// Converts the session cart into a confirmed order and clears the cart.
func (h *Handler) createOrder(w http.ResponseWriter, r *http.Request) {
	sessionID, ok := h.readSessionID(w, r)
	if !ok {
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req createOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Basic input validation at the system boundary.
	s := req.Shipping
	if s.Name == "" || s.Email == "" || s.Street == "" || s.City == "" || s.Country == "" {
		h.writeError(w, http.StatusBadRequest, "shipping name, email, street, city, and country are required")
		return
	}

	order, err := h.orders.CreateOrder(r.Context(), sessionID, req.Shipping)
	if err != nil {
		h.writeError(w, h.mapDomainError(err), err.Error())
		return
	}

	h.writeJSON(w, http.StatusCreated, order)
}

// getOrder handles GET /api/orders/{id}
func (h *Handler) getOrder(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	order, err := h.orders.GetOrder(r.Context(), id)
	if err != nil {
		h.writeError(w, h.mapDomainError(err), err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, order)
}
