/**
 * useCart — convenience hook for consuming the CartContext.
 *
 * Re-exported from the context module for consistency with the rest of the
 * hooks layer: consumers import from hooks/, not context/ directly.
 *
 * Usage:
 *   const { cart, addItem, removeItem } = useCart();
 */

export { useCart } from '../context/CartContext.jsx';
