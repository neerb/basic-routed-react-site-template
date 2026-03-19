package domain

import "errors"

var (
	// ErrProductNotFound is returned when a product ID does not exist.
	ErrProductNotFound = errors.New("product not found")

	// ErrInsufficientStock is returned when the requested quantity exceeds available stock.
	ErrInsufficientStock = errors.New("insufficient stock")

	// ErrCartItemNotFound is returned when removing or updating a product not in the cart.
	ErrCartItemNotFound = errors.New("cart item not found")

	// ErrCartEmpty is returned when checkout is attempted on an empty cart.
	ErrCartEmpty = errors.New("cart is empty")

	// ErrOrderNotFound is returned when an order ID does not exist.
	ErrOrderNotFound = errors.New("order not found")
)
