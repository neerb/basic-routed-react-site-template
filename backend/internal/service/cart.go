package service

import (
	"context"
	"fmt"

	"shop/internal/domain"
	"shop/internal/store"
)

// CartService manages shopping cart operations.
// It validates stock availability against the product catalogue before
// applying any mutation to the cart.
type CartService struct {
	carts    store.CartStore
	products store.ProductReader
}

// NewCartService creates a CartService.
func NewCartService(carts store.CartStore, products store.ProductReader) *CartService {
	return &CartService{carts: carts, products: products}
}

// GetCart returns the cart for the given session.
func (s *CartService) GetCart(ctx context.Context, sessionID string) (domain.Cart, error) {
	cart, err := s.carts.GetCart(ctx, sessionID)
	if err != nil {
		return domain.Cart{}, fmt.Errorf("get cart: %w", err)
	}
	return cart, nil
}

// AddItem adds quantity units of productID to the cart.
// When the product is already in the cart, the quantities are summed.
// Returns domain.ErrInsufficientStock when the combined quantity exceeds stock.
func (s *CartService) AddItem(ctx context.Context, sessionID, productID string, quantity int) (domain.Cart, error) {
	if quantity <= 0 {
		return domain.Cart{}, fmt.Errorf("add item: quantity must be positive")
	}

	product, err := s.products.GetProduct(ctx, productID)
	if err != nil {
		return domain.Cart{}, fmt.Errorf("add item: %w", err)
	}

	// Compute the current quantity already in the cart for this product.
	cart, err := s.carts.GetCart(ctx, sessionID)
	if err != nil {
		return domain.Cart{}, fmt.Errorf("add item: read cart: %w", err)
	}

	existing := 0
	for _, it := range cart.Items {
		if it.ProductID == productID {
			existing = it.Quantity
			break
		}
	}

	newQty := existing + quantity
	if newQty > product.Stock {
		return domain.Cart{}, fmt.Errorf("add item: %w", domain.ErrInsufficientStock)
	}

	item := domain.CartItem{
		ProductID:   product.ID,
		ProductName: product.Name,
		Price:       product.Price,
		Quantity:    newQty,
		Subtotal:    product.Price * float64(newQty),
	}
	if err := s.carts.UpsertCartItem(ctx, sessionID, item); err != nil {
		return domain.Cart{}, fmt.Errorf("add item: upsert: %w", err)
	}

	return s.carts.GetCart(ctx, sessionID)
}

// UpdateItem sets an exact quantity for an existing cart item.
// Passing quantity ≤ 0 removes the item from the cart.
func (s *CartService) UpdateItem(ctx context.Context, sessionID, productID string, quantity int) (domain.Cart, error) {
	if quantity <= 0 {
		return s.RemoveItem(ctx, sessionID, productID)
	}

	product, err := s.products.GetProduct(ctx, productID)
	if err != nil {
		return domain.Cart{}, fmt.Errorf("update item: %w", err)
	}

	if quantity > product.Stock {
		return domain.Cart{}, fmt.Errorf("update item: %w", domain.ErrInsufficientStock)
	}

	item := domain.CartItem{
		ProductID:   product.ID,
		ProductName: product.Name,
		Price:       product.Price,
		Quantity:    quantity,
		Subtotal:    product.Price * float64(quantity),
	}
	if err := s.carts.UpsertCartItem(ctx, sessionID, item); err != nil {
		return domain.Cart{}, fmt.Errorf("update item: %w", err)
	}

	return s.carts.GetCart(ctx, sessionID)
}

// RemoveItem removes a product from the cart entirely.
func (s *CartService) RemoveItem(ctx context.Context, sessionID, productID string) (domain.Cart, error) {
	if err := s.carts.RemoveCartItem(ctx, sessionID, productID); err != nil {
		return domain.Cart{}, fmt.Errorf("remove item: %w", err)
	}
	return s.carts.GetCart(ctx, sessionID)
}

// ClearCart empties the entire cart for the session.
func (s *CartService) ClearCart(ctx context.Context, sessionID string) error {
	if err := s.carts.ClearCart(ctx, sessionID); err != nil {
		return fmt.Errorf("clear cart: %w", err)
	}
	return nil
}
