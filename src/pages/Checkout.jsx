/**
 * Checkout page — shipping form + order summary, places the order.
 *
 * Route: /checkout
 *
 * Demonstrates:
 *   - FormField with multi-field validation
 *   - useCart() for reading the current cart summary
 *   - shopService.createOrder() called on submit
 *   - Navigate to /orders/:id on success
 *   - Redirect to /cart when the cart is empty
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { createOrder } from '../services/shopService.js';
import { FormField } from '../components/FormField.jsx';
import { Button } from '../components/Button.jsx';
import { validate, required, email as emailValidator } from '../utils/validators.js';
import { formatCurrency } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const INITIAL_FORM = { name: '', email: '', street: '', city: '', country: '' };

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Redirect back to cart if it becomes empty.
  useEffect(() => {
    if (cart.items.length === 0 && !submitting) {
      navigate('/cart', { replace: true });
    }
  }, [cart.items.length, submitting, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  function validateForm() {
    const next = {
      name:    validate(form.name,    [(v) => required(v, 'Full name')]),
      email:   validate(form.email,   [required, emailValidator]),
      street:  validate(form.street,  [(v) => required(v, 'Street address')]),
      city:    validate(form.city,    [(v) => required(v, 'City')]),
      country: validate(form.country, [(v) => required(v, 'Country')]),
    };
    setErrors(next);
    return Object.values(next).every((e) => e === null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const order = await createOrder(form);
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/cart" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Back to cart</Link>
      <h1 style={{ marginBottom: '1.5rem' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Shipping form */}
        <section aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" style={{ marginTop: 0 }}>Shipping details</h2>

          {submitError && (
            <p role="alert" style={{ color: '#dc2626', marginBottom: '1rem' }}>{submitError}</p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Jane Smith"
            />
            <FormField
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="jane@example.com"
            />
            <FormField
              label="Street address"
              name="street"
              value={form.street}
              onChange={handleChange}
              error={errors.street}
              required
              placeholder="123 Main St"
            />
            <FormField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              error={errors.city}
              required
            />
            <FormField
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              error={errors.country}
              required
              placeholder="United States"
            />

            <Button type="submit" loading={submitting} style={{ width: '100%', marginTop: '0.5rem' }}>
              Place order — {formatCurrency(cart.total)}
            </Button>
          </form>
        </section>

        {/* Order summary */}
        <aside style={{ border: '1px solid var(--border, #e5e4e7)', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Order summary</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
            {cart.items.map((item) => (
              <li
                key={item.productId}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem' }}
              >
                <span>{item.productName} × {item.quantity}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div style={{ borderTop: '1px solid var(--border, #e5e4e7)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatCurrency(cart.total)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
