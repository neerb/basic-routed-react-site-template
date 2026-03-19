package handler

import (
	"net/http"
	"strconv"

	"shop/internal/domain"
)

// listProducts handles GET /api/products
// Accepts query params: search, category, page, limit.
func (h *Handler) listProducts(w http.ResponseWriter, r *http.Request) {
	filter := domain.ProductFilter{
		Search:   r.URL.Query().Get("search"),
		Category: r.URL.Query().Get("category"),
	}
	if p := r.URL.Query().Get("page"); p != "" {
		filter.Page, _ = strconv.Atoi(p)
	}
	if l := r.URL.Query().Get("limit"); l != "" {
		filter.Limit, _ = strconv.Atoi(l)
	}

	result, err := h.products.ListProducts(r.Context(), filter)
	if err != nil {
		h.log.Error("list products", "err", err)
		h.writeError(w, http.StatusInternalServerError, "failed to list products")
		return
	}

	h.writeJSON(w, http.StatusOK, result)
}

// getProduct handles GET /api/products/{id}
func (h *Handler) getProduct(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	product, err := h.products.GetProduct(r.Context(), id)
	if err != nil {
		h.writeError(w, h.mapDomainError(err), err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, product)
}
