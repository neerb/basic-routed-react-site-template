/**
 * ProductDetail page — full product view with quantity selector and add-to-cart.
 *
 * Route: /shop/:id
 *
 * Demonstrates:
 *   - useParams to extract route params
 *   - useApi for product fetch
 *   - useCart for cart mutation
 *   - Controlled quantity input with stock clamping
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { useCart } from '../hooks/useCart.js';
import { getProduct } from '../services/shopService.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { Button } from '../components/Button.jsx';
import { formatCurrency } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error, execute } = useApi(getProduct);
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    execute(id);
  }, [id, execute]);

  // Clamp quantity to [1, stock] whenever the product loads.
  useEffect(() => {
    if (product) setQuantity(1);
  }, [product]);

  async function handleAddToCart() {
    setAdding(true);
    setAddError(null);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <Link to="/shop">← Back to shop</Link>
        <p role="alert" style={{ color: '#dc2626', marginTop: '1rem' }}>
          {getErrorMessage(error)}
        </p>
      </main>
    );
  }

  if (!product) return null;

  const outOfStock = product.stock === 0;

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/shop" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        ← Back to shop
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        {/* Image */}
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', borderRadius: '0.5rem', display: 'block' }}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image'; }}
          />
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase' }}>
            {product.category}
          </span>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{product.name}</h1>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            {formatCurrency(product.price)}
          </p>
          <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>{product.description}</p>

          {/* Stock badge */}
          {outOfStock && (
            <p style={{ color: '#dc2626', fontWeight: 600 }}>Out of stock</p>
          )}
          {!outOfStock && product.stock <= 5 && (
            <p style={{ color: '#d97706' }}>Only {product.stock} left in stock</p>
          )}

          {/* Quantity + Add to cart */}
          {!outOfStock && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={qBtnStyle}
                >
                  −
                </button>
                <span
                  aria-live="polite"
                  aria-label={`Quantity: ${quantity}`}
                  style={{ padding: '0.5rem 1rem', border: '1px solid var(--border, #d1d5db)', minWidth: '3rem', textAlign: 'center' }}
                >
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  style={qBtnStyle}
                >
                  +
                </button>
              </div>

              <Button
                loading={adding}
                variant={added ? 'secondary' : 'primary'}
                onClick={handleAddToCart}
              >
                {added ? '✓ Added to cart' : 'Add to cart'}
              </Button>
            </div>
          )}

          {addError && (
            <p role="alert" style={{ color: '#dc2626', margin: 0 }}>{addError}</p>
          )}

          {/* Navigate to cart after adding */}
          {added && (
            <button
              onClick={() => navigate('/cart')}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', textAlign: 'left', padding: 0 }}
            >
              View cart →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

const qBtnStyle = {
  padding: '0.5rem 0.875rem',
  border: '1px solid var(--border, #d1d5db)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1rem',
};
