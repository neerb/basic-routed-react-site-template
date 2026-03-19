package service

import (
	"context"
	"fmt"
	"time"

	"shop/internal/domain"
	"shop/internal/store"
)

// OrderService manages order creation and retrieval.
type OrderService struct {
	orders store.OrderStore
	carts  store.CartStore
}

// NewOrderService creates an OrderService.
func NewOrderService(orders store.OrderStore, carts store.CartStore) *OrderService {
	return &OrderService{orders: orders, carts: carts}
}

// CreateOrder converts the session's current cart into a confirmed order,
// then clears the cart.  Returns domain.ErrCartEmpty when the cart has no items.
func (s *OrderService) CreateOrder(ctx context.Context, sessionID string, shipping domain.ShippingAddress) (domain.Order, error) {
	cart, err := s.carts.GetCart(ctx, sessionID)
	if err != nil {
		return domain.Order{}, fmt.Errorf("create order: read cart: %w", err)
	}

	if len(cart.Items) == 0 {
		return domain.Order{}, fmt.Errorf("create order: %w", domain.ErrCartEmpty)
	}

	// Snapshot cart items into order items — prices are frozen at checkout time.
	orderItems := make([]domain.OrderItem, len(cart.Items))
	for i, it := range cart.Items {
		orderItems[i] = domain.OrderItem{
			ProductID:   it.ProductID,
			ProductName: it.ProductName,
			Price:       it.Price,
			Quantity:    it.Quantity,
			Subtotal:    it.Subtotal,
		}
	}

	order := domain.Order{
		ID:        newOrderID(),
		SessionID: sessionID,
		Items:     orderItems,
		Total:     cart.Total,
		Status:    domain.OrderStatusConfirmed,
		Shipping:  shipping,
		CreatedAt: time.Now().UTC(),
	}

	if err := s.orders.CreateOrder(ctx, order); err != nil {
		return domain.Order{}, fmt.Errorf("create order: persist: %w", err)
	}

	// Clear the cart after a successful order.  This is best-effort —
	// if it fails the order is still valid; log at the call site.
	_ = s.carts.ClearCart(ctx, sessionID)

	return order, nil
}

// GetOrder retrieves an order by ID.
func (s *OrderService) GetOrder(ctx context.Context, id string) (domain.Order, error) {
	o, err := s.orders.GetOrder(ctx, id)
	if err != nil {
		return domain.Order{}, fmt.Errorf("get order %q: %w", id, err)
	}
	return o, nil
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// newOrderID generates a unique order identifier with an "ord-" prefix.
func newOrderID() string {
	return "ord-" + store.NewID()
}
