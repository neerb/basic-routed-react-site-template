package handler

import (
	"encoding/json"
	"net/http"
)

// getCart handles GET /api/cart
func (h *Handler) getCart(w http.ResponseWriter, r *http.Request) {
	sessionID, ok := h.readSessionID(w, r)
	if !ok {
		return
	}

	cart, err := h.carts.GetCart(r.Context(), sessionID)
	if err != nil {
		h.log.Error("get cart", "session", sessionID, "err", err)
		h.writeError(w, http.StatusInternalServerError, "failed to get cart")
		return
	}

	h.writeJSON(w, http.StatusOK, cart)
}

// addCartItemRequest is the request body for POST /api/cart/items.
type addCartItemRequest struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
}

// addCartItem handles POST /api/cart/items
func (h *Handler) addCartItem(w http.ResponseWriter, r *http.Request) {
	sessionID, ok := h.readSessionID(w, r)
	if !ok {
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req addCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.ProductID == "" || req.Quantity <= 0 {
		h.writeError(w, http.StatusBadRequest, "productId and a positive quantity are required")
		return
	}

	cart, err := h.carts.AddItem(r.Context(), sessionID, req.ProductID, req.Quantity)
	if err != nil {
		h.writeError(w, h.mapDomainError(err), err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, cart)
}

// updateCartItemRequest is the request body for PATCH /api/cart/items/{productId}.
type updateCartItemRequest struct {
	Quantity int `json:"quantity"`
}

// updateCartItem handles PATCH /api/cart/items/{productId}
func (h *Handler) updateCartItem(w http.ResponseWriter, r *http.Request) {
	sessionID, ok := h.readSessionID(w, r)
	if !ok {
		return
	}

	productID := r.PathValue("productId")

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req updateCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	cart, err := h.carts.UpdateItem(r.Context(), sessionID, productID, req.Quantity)
	if err != nil {
		h.writeError(w, h.mapDomainError(err), err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, cart)
}

// removeCartItem handles DELETE /api/cart/items/{productId}
func (h *Handler) removeCartItem(w http.ResponseWriter, r *http.Request) {
	sessionID, ok := h.readSessionID(w, r)
	if !ok {
		return
	}

	productID := r.PathValue("productId")

	cart, err := h.carts.RemoveItem(r.Context(), sessionID, productID)
	if err != nil {
		h.writeError(w, h.mapDomainError(err), err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, cart)
}

// clearCart handles DELETE /api/cart
func (h *Handler) clearCart(w http.ResponseWriter, r *http.Request) {
	sessionID, ok := h.readSessionID(w, r)
	if !ok {
		return
	}

	if err := h.carts.ClearCart(r.Context(), sessionID); err != nil {
		h.log.Error("clear cart", "session", sessionID, "err", err)
		h.writeError(w, http.StatusInternalServerError, "failed to clear cart")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
