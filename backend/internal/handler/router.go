package handler

import "net/http"

// NewRouter assembles the HTTP mux and wraps it in the CORS middleware.
// All routes are namespaced under /api/ so they can coexist with a reverse
// proxy that serves the frontend from the same host.
func NewRouter(h *Handler) http.Handler {
	mux := http.NewServeMux()

	// Products
	mux.HandleFunc("GET /api/products", h.listProducts)
	mux.HandleFunc("GET /api/products/{id}", h.getProduct)

	// Cart
	mux.HandleFunc("GET /api/cart", h.getCart)
	mux.HandleFunc("POST /api/cart/items", h.addCartItem)
	mux.HandleFunc("PATCH /api/cart/items/{productId}", h.updateCartItem)
	mux.HandleFunc("DELETE /api/cart/items/{productId}", h.removeCartItem)
	mux.HandleFunc("DELETE /api/cart", h.clearCart)

	// Orders
	mux.HandleFunc("POST /api/orders", h.createOrder)
	mux.HandleFunc("GET /api/orders/{id}", h.getOrder)

	return corsMiddleware(mux)
}
