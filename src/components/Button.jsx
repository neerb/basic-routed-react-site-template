/**
 * Button — reusable button component with variant and size support.
 *
 * Supports three visual variants: 'primary', 'secondary', 'danger'.
 * Supports three sizes: 'sm', 'md', 'lg'.
 * Forwards all standard button attributes (onClick, type, disabled, etc.).
 *
 * When loading=true the button is disabled and shows a spinner inside it,
 * preventing duplicate submissions while async operations are in flight.
 */

import { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner.jsx';

const variantStyles = {
  primary: {
    background: 'var(--color-primary, #2563eb)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-primary, #2563eb)',
    border: '1px solid var(--color-primary, #2563eb)',
  },
  danger: {
    background: 'var(--color-danger, #dc2626)',
    color: '#fff',
    border: 'none',
  },
};

const sizeStyles = {
  sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
  md: { padding: '0.5rem 1.25rem', fontSize: '1rem' },
  lg: { padding: '0.75rem 1.75rem', fontSize: '1.125rem' },
};

/**
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   size?:    'sm' | 'md' | 'lg',
 *   loading?: boolean,
 *   children: React.ReactNode,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, children, style, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderRadius: '0.375rem',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.2s',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {loading && <LoadingSpinner size={16} />}
      {children}
    </button>
  );
});
