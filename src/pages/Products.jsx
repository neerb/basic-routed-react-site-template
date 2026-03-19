/**
 * Products page — browsable product catalogue with search and category filter.
 *
 * Demonstrates:
 *   - useApi() for data fetching
 *   - useDebounce() to throttle search API calls as the user types
 *   - Category filter state with URL-independent local state
 *   - ProductCard grid with loading / error / empty states
 */

import { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { listProducts } from '../services/shopService.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { DEBOUNCE } from '../utils/constants.js';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Clothing', 'Home'];

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounce(search, DEBOUNCE.SEARCH);

  const { data, loading, error, execute } = useApi(listProducts);

  // Re-fetch whenever the debounced search or category changes.
  useEffect(() => {
    execute({ search: debouncedSearch, category, page: 1, limit: 12 });
  }, [debouncedSearch, category, execute]);

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Shop</h1>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border, #d1d5db)',
            fontSize: '1rem',
            minWidth: '220px',
          }}
        />

        <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const value = cat === 'All' ? '' : cat;
            const active = category === value;
            return (
              <button
                key={cat}
                onClick={() => setCategory(value)}
                aria-pressed={active}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '2rem',
                  border: '1px solid var(--border, #d1d5db)',
                  background: active ? 'var(--color-primary, #2563eb)' : 'transparent',
                  color: active ? '#fff' : 'inherit',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      {loading && <LoadingSpinner />}

      {error && (
        <p role="alert" style={{ color: '#dc2626' }}>
          Failed to load products. Make sure the backend is running on port 8080.
        </p>
      )}

      {data && !loading && data.products.length === 0 && (
        <p>No products match your search.</p>
      )}

      {/* Grid */}
      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {data && data.total > data.limit && (
        <p style={{ marginTop: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
          Showing {data.products.length} of {data.total} products
        </p>
      )}
    </main>
  );
}
