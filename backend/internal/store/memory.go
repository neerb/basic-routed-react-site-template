package store

import (
	"context"
	"crypto/rand"
	"fmt"
	"sort"
	"strings"
	"sync"

	"shop/internal/domain"
)

// MemoryStore implements ProductReader, CartStore, and OrderStore using in-memory
// maps protected by a read/write mutex.  It is safe for concurrent use.
// Data is lost on process restart — intended for development and testing only.
type MemoryStore struct {
	mu       sync.RWMutex
	products map[string]domain.Product
	carts    map[string][]domain.CartItem // sessionID → items
	orders   map[string]domain.Order
}

// NewMemoryStore creates a MemoryStore pre-loaded with seed product data.
func NewMemoryStore() *MemoryStore {
	s := &MemoryStore{
		products: make(map[string]domain.Product),
		carts:    make(map[string][]domain.CartItem),
		orders:   make(map[string]domain.Order),
	}
	for _, p := range seedProducts() {
		s.products[p.ID] = p
	}
	return s
}

// ---------------------------------------------------------------------------
// ProductReader
// ---------------------------------------------------------------------------

// ListProducts returns a filtered, sorted, paginated slice of products.
func (s *MemoryStore) ListProducts(_ context.Context, filter domain.ProductFilter) (domain.ProductList, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var matched []domain.Product
	for _, p := range s.products {
		if filter.Category != "" && !strings.EqualFold(p.Category, filter.Category) {
			continue
		}
		if filter.Search != "" {
			q := strings.ToLower(filter.Search)
			if !strings.Contains(strings.ToLower(p.Name), q) &&
				!strings.Contains(strings.ToLower(p.Description), q) {
				continue
			}
		}
		matched = append(matched, p)
	}

	// Stable ordering by ID so pages are deterministic.
	sort.Slice(matched, func(i, j int) bool {
		return matched[i].ID < matched[j].ID
	})

	total := len(matched)

	start := (filter.Page - 1) * filter.Limit
	if start >= total {
		return domain.ProductList{
			Products: []domain.Product{},
			Total:    total,
			Page:     filter.Page,
			Limit:    filter.Limit,
		}, nil
	}
	end := start + filter.Limit
	if end > total {
		end = total
	}

	return domain.ProductList{
		Products: matched[start:end],
		Total:    total,
		Page:     filter.Page,
		Limit:    filter.Limit,
	}, nil
}

// GetProduct returns a single product by ID.
func (s *MemoryStore) GetProduct(_ context.Context, id string) (domain.Product, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, ok := s.products[id]
	if !ok {
		return domain.Product{}, domain.ErrProductNotFound
	}
	return p, nil
}

// ---------------------------------------------------------------------------
// CartStore
// ---------------------------------------------------------------------------

// GetCart returns the cart for a session.  An empty cart is returned if no
// items have been added yet.
func (s *MemoryStore) GetCart(_ context.Context, sessionID string) (domain.Cart, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return buildCart(sessionID, s.cartItems(sessionID)), nil
}

// UpsertCartItem adds or replaces a line-item in the session's cart.
func (s *MemoryStore) UpsertCartItem(_ context.Context, sessionID string, item domain.CartItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	items := s.carts[sessionID]
	for i, existing := range items {
		if existing.ProductID == item.ProductID {
			items[i] = item
			s.carts[sessionID] = items
			return nil
		}
	}
	s.carts[sessionID] = append(items, item)
	return nil
}

// RemoveCartItem removes the line-item for productID from the session's cart.
func (s *MemoryStore) RemoveCartItem(_ context.Context, sessionID, productID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	items := s.carts[sessionID]
	for i, item := range items {
		if item.ProductID == productID {
			s.carts[sessionID] = append(items[:i], items[i+1:]...)
			return nil
		}
	}
	return domain.ErrCartItemNotFound
}

// ClearCart removes all items from the session's cart.
func (s *MemoryStore) ClearCart(_ context.Context, sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.carts, sessionID)
	return nil
}

// ---------------------------------------------------------------------------
// OrderStore
// ---------------------------------------------------------------------------

// CreateOrder persists a new order.
func (s *MemoryStore) CreateOrder(_ context.Context, order domain.Order) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.orders[order.ID] = order
	return nil
}

// GetOrder retrieves an order by ID.
func (s *MemoryStore) GetOrder(_ context.Context, id string) (domain.Order, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	o, ok := s.orders[id]
	if !ok {
		return domain.Order{}, domain.ErrOrderNotFound
	}
	return o, nil
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// cartItems returns a copy of the session's cart slice.  Caller must hold mu.RLock.
func (s *MemoryStore) cartItems(sessionID string) []domain.CartItem {
	src := s.carts[sessionID]
	if src == nil {
		return []domain.CartItem{}
	}
	cp := make([]domain.CartItem, len(src))
	copy(cp, src)
	return cp
}

// buildCart derives Cart totals from a slice of CartItems.
func buildCart(sessionID string, items []domain.CartItem) domain.Cart {
	var total float64
	var count int
	for _, it := range items {
		total += it.Subtotal
		count += it.Quantity
	}
	return domain.Cart{
		SessionID: sessionID,
		Items:     items,
		Total:     total,
		ItemCount: count,
	}
}

// NewID generates a cryptographically random 24-character hex string.
func NewID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// ---------------------------------------------------------------------------
// Seed data — 12 products across 4 categories
// ---------------------------------------------------------------------------

func seedProducts() []domain.Product {
	return []domain.Product{
		{
			ID:          "prod-001",
			Name:        "Mechanical Keyboard",
			Description: "Full-size mechanical keyboard with Cherry MX Blue switches. Tactile and clicky feedback ideal for typing enthusiasts.",
			Price:       89.99,
			Category:    "Electronics",
			ImageURL:    "https://placehold.co/400x300/1a1a2e/ffffff?text=Keyboard",
			Stock:       25,
		},
		{
			ID:          "prod-002",
			Name:        "Wireless Mouse",
			Description: "Ergonomic wireless mouse with 12-month battery life and silent clicks. Office-friendly design.",
			Price:       39.99,
			Category:    "Electronics",
			ImageURL:    "https://placehold.co/400x300/1a1a2e/ffffff?text=Mouse",
			Stock:       40,
		},
		{
			ID:          "prod-003",
			Name:        "USB-C Hub 7-in-1",
			Description: "Expand laptop connectivity with 4K HDMI, 3×USB-A, SD/microSD readers, and 100W Power Delivery pass-through.",
			Price:       49.99,
			Category:    "Electronics",
			ImageURL:    "https://placehold.co/400x300/1a1a2e/ffffff?text=USB+Hub",
			Stock:       60,
		},
		{
			ID:          "prod-004",
			Name:        "Noise-Cancelling Headphones",
			Description: "Over-ear ANC headphones with 30-hour battery life. Foldable design with premium carrying case.",
			Price:       149.99,
			Category:    "Electronics",
			ImageURL:    "https://placehold.co/400x300/1a1a2e/ffffff?text=Headphones",
			Stock:       15,
		},
		{
			ID:          "prod-005",
			Name:        "The Pragmatic Programmer",
			Description: "Classic software engineering book covering tips and philosophies for becoming a better developer. 20th anniversary edition.",
			Price:       44.99,
			Category:    "Books",
			ImageURL:    "https://placehold.co/400x300/16213e/ffffff?text=Pragmatic",
			Stock:       30,
		},
		{
			ID:          "prod-006",
			Name:        "Clean Code",
			Description: "Robert C. Martin's guide to writing readable, maintainable software. A required read for every professional developer.",
			Price:       38.99,
			Category:    "Books",
			ImageURL:    "https://placehold.co/400x300/16213e/ffffff?text=Clean+Code",
			Stock:       35,
		},
		{
			ID:          "prod-007",
			Name:        "Designing Data-Intensive Applications",
			Description: "Deep dive into modern distributed systems — reliability, scalability, and maintainability at scale.",
			Price:       52.99,
			Category:    "Books",
			ImageURL:    "https://placehold.co/400x300/16213e/ffffff?text=DDIA",
			Stock:       20,
		},
		{
			ID:          "prod-008",
			Name:        "Developer Hoodie",
			Description: "Comfortable organic cotton-blend hoodie. Minimal chest logo. Available in charcoal grey.",
			Price:       59.99,
			Category:    "Clothing",
			ImageURL:    "https://placehold.co/400x300/0f3460/ffffff?text=Hoodie",
			Stock:       45,
		},
		{
			ID:          "prod-009",
			Name:        "Classic T-Shirt",
			Description: "100% organic cotton tee. Lightweight and breathable. Available in black, white, and navy.",
			Price:       24.99,
			Category:    "Clothing",
			ImageURL:    "https://placehold.co/400x300/0f3460/ffffff?text=T-Shirt",
			Stock:       80,
		},
		{
			ID:          "prod-010",
			Name:        "Desk Mat XL",
			Description: "Extra-large desk mat (90×45 cm). Non-slip base, water-resistant surface. Improves mouse precision.",
			Price:       29.99,
			Category:    "Home",
			ImageURL:    "https://placehold.co/400x300/533483/ffffff?text=Desk+Mat",
			Stock:       55,
		},
		{
			ID:          "prod-011",
			Name:        "Cable Management Kit",
			Description: "Complete desk cable organiser: velcro ties, adhesive clips, routing channels, and a cable box.",
			Price:       19.99,
			Category:    "Home",
			ImageURL:    "https://placehold.co/400x300/533483/ffffff?text=Cables",
			Stock:       70,
		},
		{
			ID:          "prod-012",
			Name:        "Adjustable Laptop Stand",
			Description: "Aluminium laptop stand with six height settings. Raises screen to eye level to reduce neck strain.",
			Price:       34.99,
			Category:    "Home",
			ImageURL:    "https://placehold.co/400x300/533483/ffffff?text=Stand",
			Stock:       50,
		},
	}
}
