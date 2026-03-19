package domain

// CartItem is a single line-item in a shopping cart.
type CartItem struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

// Cart represents the shopping basket for a given browser session.
type Cart struct {
	SessionID string     `json:"sessionId"`
	Items     []CartItem `json:"items"`
	Total     float64    `json:"total"`
	ItemCount int        `json:"itemCount"`
}
