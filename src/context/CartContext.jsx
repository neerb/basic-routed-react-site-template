/**
 * CartContext — application-wide shopping cart state.
 *
 * CartProvider loads the cart from the API on mount and exposes mutation
 * methods (addItem, updateItem, removeItem, emptyCart) that update server
 * state and then sync local React state from the response.
 *
 * This means the UI always reflects the canonical server-side cart:
 * no optimistic updates that could diverge from actual stock counts.
 *
 * Consumers should use useCart() rather than consuming CartContext directly.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as shop from '../services/shopService.js';

export const CartContext = createContext(undefined);

const EMPTY_CART = { items: [], total: 0, itemCount: 0 };

/**
 * CartProvider must wrap any part of the tree that calls useCart().
 * Typically placed inside BrowserRouter in main.jsx or App.jsx.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Load cart from server on mount.
  const refresh = useCallback(async () => {
    try {
      const data = await shop.getCart();
      setCart(data);
    } catch (err) {
      setCartError(err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * addItem adds quantity units of productId to the cart.
   * Returns the updated Cart on success, throws on error.
   */
  const addItem = useCallback(async (productId, quantity = 1) => {
    setCartLoading(true);
    try {
      const updated = await shop.addToCart(productId, quantity);
      setCart(updated);
      return updated;
    } finally {
      setCartLoading(false);
    }
  }, []);

  /**
   * updateItem sets an exact quantity for a cart line-item.
   * Passing quantity ≤ 0 removes the item.
   */
  const updateItem = useCallback(async (productId, quantity) => {
    setCartLoading(true);
    try {
      const updated = await shop.updateCartItem(productId, quantity);
      setCart(updated);
      return updated;
    } finally {
      setCartLoading(false);
    }
  }, []);

  /** removeItem removes a product from the cart entirely. */
  const removeItem = useCallback(async (productId) => {
    setCartLoading(true);
    try {
      const updated = await shop.removeFromCart(productId);
      setCart(updated);
      return updated;
    } finally {
      setCartLoading(false);
    }
  }, []);

  /** emptyCart clears all items server-side and resets local state. */
  const emptyCart = useCallback(async () => {
    await shop.clearCart();
    setCart(EMPTY_CART);
  }, []);

  const value = {
    cart,
    cartLoading,
    cartError,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart returns the CartContext value.
 * Throws if called outside a CartProvider tree.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
