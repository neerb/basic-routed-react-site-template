import { NavLink } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import './Nav.css';

/**
 * Nav — application top navigation bar.
 *
 * Uses NavLink so the active route receives the "active" class automatically.
 * The Cart link shows a badge with the current item count sourced from
 * CartContext so it stays in sync with all cart mutations.
 */
export default function Nav() {
  const { cart } = useCart();
  const itemCount = cart?.itemCount ?? 0;

  return (
    <nav>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/about">About</NavLink>
      <NavLink to="/shop">Shop</NavLink>
      <NavLink to="/cart" style={{ position: 'relative' }}>
        Cart
        {itemCount > 0 && (
          <span
            aria-label={`${itemCount} item${itemCount !== 1 ? 's' : ''} in cart`}
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-10px',
              background: 'var(--color-primary, #2563eb)',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 5px',
              lineHeight: 1.4,
              minWidth: '16px',
              textAlign: 'center',
            }}
          >
            {itemCount}
          </span>
        )}
      </NavLink>
      <NavLink to="/settings">Settings</NavLink>
      <NavLink to="/login">Login</NavLink>
    </nav>
  );
}
