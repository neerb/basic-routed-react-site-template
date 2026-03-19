// Package domain contains the core types for the shop service.
package domain

// Product represents a single purchasable item in the catalogue.
type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Category    string  `json:"category"`
	ImageURL    string  `json:"imageUrl"`
	Stock       int     `json:"stock"`
}

// ProductFilter carries optional search and pagination parameters for listing products.
type ProductFilter struct {
	Search   string
	Category string
	Page     int
	Limit    int
}

// ProductList is the paginated response returned by ListProducts.
type ProductList struct {
	Products []Product `json:"products"`
	Total    int       `json:"total"`
	Page     int       `json:"page"`
	Limit    int       `json:"limit"`
}
