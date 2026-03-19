/**
 * OrderConfirmation page — success screen shown after a successful checkout.
 *
 * Route: /orders/:id
 *
 * Fetches the full order from the API so the confirmation is always
 * accurate even if the user navigates directly to this URL.
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { getOrder } from '../services/shopService.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order, loading, error, execute } = useApi(getOrder);

  useEffect(() => {
    execute(id);
  }, [id, execute]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <p role="alert" style={{ color: '#dc2626' }}>{getErrorMessage(error)}</p>
        <Link to="/shop">Back to shop</Link>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem' }}>
      {/* Success banner */}
      <div
        style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '2rem' }}>✓</p>
        <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: '#166534' }}>
          Order confirmed!
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: '#166534' }}>
          Thank you, {order.shipping.name}. Your order has been placed.
        </p>
      </div>

      {/* Order meta */}
      <section aria-labelledby="order-meta-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="order-meta-heading" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Order details</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 1rem', fontSize: '0.875rem' }}>
          <dt style={{ fontWeight: 600 }}>Order ID</dt>
          <dd style={{ margin: 0, fontFamily: 'monospace' }}>{order.id}</dd>
          <dt style={{ fontWeight: 600 }}>Placed</dt>
          <dd style={{ margin: 0 }}>{formatDateTime(order.createdAt)}</dd>
          <dt style={{ fontWeight: 600 }}>Status</dt>
          <dd style={{ margin: 0, textTransform: 'capitalize' }}>{order.status}</dd>
        </dl>
      </section>

      {/* Shipping */}
      <section aria-labelledby="shipping-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="shipping-heading" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Shipping to</h2>
        <address style={{ fontStyle: 'normal', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {order.shipping.name}<br />
          {order.shipping.street}<br />
          {order.shipping.city}, {order.shipping.country}<br />
          {order.shipping.email}
        </address>
      </section>

      {/* Items */}
      <section aria-labelledby="items-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="items-heading" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Items ordered</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {order.items.map((item) => (
            <li
              key={item.productId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border, #e5e4e7)',
                fontSize: '0.875rem',
              }}
            >
              <span>{item.productName} × {item.quantity}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, margin: '0.75rem 0 0' }}>
          <span>Total paid</span>
          <span>{formatCurrency(order.total)}</span>
        </p>
      </section>

      <Link
        to="/shop"
        style={{
          display: 'inline-block',
          padding: '0.5rem 1.25rem',
          background: 'var(--color-primary, #2563eb)',
          color: '#fff',
          borderRadius: '0.375rem',
          textDecoration: 'none',
        }}
      >
        Continue shopping
      </Link>
    </main>
  );
}
