/**
 * ProductCard — single product tile for the grid layout on the Products page.
 *
 * Clicking anywhere on the card navigates to the product detail page.
 * The "Add to cart" button stops propagation so its click doesn't also
 * trigger the card navigation.
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from './Button.jsx';
import { useCart } from '../hooks/useCart.js';
import { formatCurrency } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';

/**
 * @param {{ product: import('../services/shopService.js').Product }} props
 */
export function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart(e) {
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  return (
    <article
      onClick={() => navigate(`/shop/${product.id}`)}
      style={{
        border: '1px solid var(--border, #e5e4e7)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image'; }}
      />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6b7280',
          }}
        >
          {product.category}
        </span>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{product.name}</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', flex: 1 }}>
          {product.description.slice(0, 80)}{product.description.length > 80 ? '…' : ''}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <strong style={{ fontSize: '1.1rem' }}>{formatCurrency(product.price)}</strong>
          <Button
            size="sm"
            variant={added ? 'secondary' : 'primary'}
            loading={adding}
            onClick={handleAddToCart}
          >
            {added ? '✓ Added' : 'Add to cart'}
          </Button>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#d97706' }}>
            Only {product.stock} left
          </p>
        )}
        {product.stock === 0 && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>Out of stock</p>
        )}
      </div>
    </article>
  );
}
