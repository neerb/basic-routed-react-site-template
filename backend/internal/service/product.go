// Package service contains the business logic for the shop.
package service

import (
	"context"
	"fmt"

	"shop/internal/domain"
	"shop/internal/store"
)

// ProductService handles listing and retrieval of catalogue products.
type ProductService struct {
	products store.ProductReader
}

// NewProductService creates a ProductService.
func NewProductService(products store.ProductReader) *ProductService {
	return &ProductService{products: products}
}

// ListProducts returns a paginated, optionally-filtered product list.
// Page and Limit default to 1 and 20 respectively if not set by the caller.
func (s *ProductService) ListProducts(ctx context.Context, filter domain.ProductFilter) (domain.ProductList, error) {
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 20
	}

	result, err := s.products.ListProducts(ctx, filter)
	if err != nil {
		return domain.ProductList{}, fmt.Errorf("list products: %w", err)
	}
	return result, nil
}

// GetProduct retrieves a single product by ID.
// Returns domain.ErrProductNotFound (wrapped) when the ID does not exist.
func (s *ProductService) GetProduct(ctx context.Context, id string) (domain.Product, error) {
	p, err := s.products.GetProduct(ctx, id)
	if err != nil {
		return domain.Product{}, fmt.Errorf("get product %q: %w", id, err)
	}
	return p, nil
}
