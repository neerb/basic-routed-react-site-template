// Package store defines persistence interfaces and their in-memory implementations.
package store

import (
	"context"

	"shop/internal/domain"
)

// ProductReader defines read access to the product catalogue.
// Accepted by services that need to look up products.
type ProductReader interface {
	ListProducts(ctx context.Context, filter domain.ProductFilter) (domain.ProductList, error)
	GetProduct(ctx context.Context, id string) (domain.Product, error)
}

// CartStore defines operations on shopping carts keyed by session ID.
type CartStore interface {
	GetCart(ctx context.Context, sessionID string) (domain.Cart, error)
	UpsertCartItem(ctx context.Context, sessionID string, item domain.CartItem) error
	RemoveCartItem(ctx context.Context, sessionID, productID string) error
	ClearCart(ctx context.Context, sessionID string) error
}

// OrderStore defines operations on placed orders.
type OrderStore interface {
	CreateOrder(ctx context.Context, order domain.Order) error
	GetOrder(ctx context.Context, id string) (domain.Order, error)
}
