/**
 * Cart page — displays current cart contents with edit controls.
 *
 * Route: /cart
 *
 * Demonstrates:
 *   - useCart() context consumption for reading and mutating cart state
 *   - Quantity +/− controls with optimistic-feeling updates (server-confirmed)
 *   - Empty state with call-to-action
 *   - Real-time total from server response
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../hooks/useCart.js';
import { Button } from '../components/Button.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { formatCurrency } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';

export default function Cart() {
  const { cart, cartLoading, updateItem, removeItem, emptyCart } = useCart();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState(null);

  async function handleUpdate(productId, quantity) {
    setActionError(null);
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleRemove(productId) {
    setActionError(null);
    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleEmpty() {
    if (!confirm('Clear all items from your cart?')) return;
    await emptyCart();
  }

  const isEmpty = cart.items.length === 0;

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem' }}>
      <h1>Your Cart</h1>

      {cartLoading && <LoadingSpinner />}
      {actionError && (
        <p role="alert" style={{ color: '#dc2626', marginBottom: '1rem' }}>{actionError}</p>
      )}

      {isEmpty && !cartLoading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your cart is empty.</p>
          <Link
            to="/shop"
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--color-primary, #2563eb)',
              color: '#fff',
              borderRadius: '0.375rem',
              textDecoration: 'none',
            }}
          >
            Browse products
          </Link>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* Item list */}
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          {/* Summary */}
          <div
            style={{
              borderTop: '2px solid var(--border, #e5e4e7)',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                Total: {formatCurrency(cart.total)}
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={handleEmpty}>
                Clear cart
              </Button>
              <Button onClick={() => navigate('/checkout')}>
                Proceed to checkout →
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// CartItemRow sub-component
// ---------------------------------------------------------------------------

function CartItemRow({ item, onUpdate, onRemove }) {
  const [updating, setUpdating] = useState(false);

  async function change(quantity) {
    setUpdating(true);
    try {
      await onUpdate(item.productId, quantity);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: '1rem',
        alignItems: 'center',
        padding: '1rem',
        border: '1px solid var(--border, #e5e4e7)',
        borderRadius: '0.5rem',
      }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>
          <Link to={`/shop/${item.productId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.productName}
          </Link>
        </p>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
          {formatCurrency(item.price)} each
        </p>
      </div>

      {/* Quantity controls */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button disabled={updating || item.quantity <= 1} onClick={() => change(item.quantity - 1)} style={qBtnStyle}>−</button>
        <span style={{ padding: '0 0.75rem', minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
        <button disabled={updating} onClick={() => change(item.quantity + 1)} style={qBtnStyle}>+</button>
      </div>

      <strong>{formatCurrency(item.subtotal)}</strong>

      <button
        onClick={() => onRemove(item.productId)}
        aria-label={`Remove ${item.productName} from cart`}
        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem' }}
      >
        ×
      </button>
    </li>
  );
}

const qBtnStyle = {
  padding: '0.25rem 0.625rem',
  border: '1px solid var(--border, #d1d5db)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1rem',
  borderRadius: '0.25rem',
};
