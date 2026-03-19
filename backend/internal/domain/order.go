package domain

import "time"

// OrderStatus represents the lifecycle state of an order.
type OrderStatus string

const (
	OrderStatusConfirmed OrderStatus = "confirmed"
)

// ShippingAddress holds the customer's delivery information collected at checkout.
type ShippingAddress struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Street  string `json:"street"`
	City    string `json:"city"`
	Country string `json:"country"`
}

// OrderItem is an immutable snapshot of a cart line-item taken at checkout time.
// Prices are captured so the order record is unaffected by future catalogue changes.
type OrderItem struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

// Order is a confirmed and persisted purchase.
type Order struct {
	ID        string          `json:"id"`
	SessionID string          `json:"sessionId"`
	Items     []OrderItem     `json:"items"`
	Total     float64         `json:"total"`
	Status    OrderStatus     `json:"status"`
	Shipping  ShippingAddress `json:"shipping"`
	CreatedAt time.Time       `json:"createdAt"`
}
