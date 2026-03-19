/**
 * shopService — API calls for products, cart, and orders.
 *
 * All cart-mutating requests include the X-Session-ID header so the backend
 * can associate the request with the correct cart without authentication.
 *
 * Base URL is proxied through Vite in development: /api → localhost:8080/api.
 */

import * as api from './apiClient.js';
import { getSessionId } from '../utils/session.js';

// Attach the session ID header to every cart/order request.
const sessionOpts = () => ({ headers: { 'X-Session-ID': getSessionId() } });

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/**
 * listProducts fetches a paginated, optionally-filtered product list.
 *
 * @param {{ search?: string, category?: string, page?: number, limit?: number }} [params]
 * @returns {Promise<{ products: Product[], total: number, page: number, limit: number }>}
 */
export async function listProducts({ search = '', category = '', page = 1, limit = 12 } = {}) {
  const qs = new URLSearchParams();
  if (search)   qs.set('search', search);
  if (category) qs.set('category', category);
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  return api.get(`/products?${qs}`);
}

/**
 * getProduct fetches a single product by ID.
 *
 * @param {string} id
 * @returns {Promise<Product>}
 */
export async function getProduct(id) {
  return api.get(`/products/${id}`);
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

/** @returns {Promise<Cart>} */
export async function getCart() {
  return api.get('/cart', sessionOpts());
}

/**
 * addToCart adds quantity units of a product to the session cart.
 *
 * @param {string} productId
 * @param {number} [quantity=1]
 * @returns {Promise<Cart>}
 */
export async function addToCart(productId, quantity = 1) {
  return api.post('/cart/items', { productId, quantity }, sessionOpts());
}

/**
 * updateCartItem sets the exact quantity for an existing cart item.
 * Pass quantity=0 to remove the item.
 *
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 */
export async function updateCartItem(productId, quantity) {
  return api.patch(`/cart/items/${productId}`, { quantity }, sessionOpts());
}

/**
 * removeFromCart removes a product from the cart entirely.
 *
 * @param {string} productId
 * @returns {Promise<Cart>}
 */
export async function removeFromCart(productId) {
  return api.del(`/cart/items/${productId}`, sessionOpts());
}

/** @returns {Promise<null>} */
export async function clearCart() {
  return api.del('/cart', sessionOpts());
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/**
 * createOrder submits the current cart as a confirmed order.
 *
 * @param {{ name: string, email: string, street: string, city: string, country: string }} shipping
 * @returns {Promise<Order>}
 */
export async function createOrder(shipping) {
  return api.post('/orders', { shipping }, sessionOpts());
}

/**
 * getOrder retrieves a placed order by ID.
 *
 * @param {string} id
 * @returns {Promise<Order>}
 */
export async function getOrder(id) {
  return api.get(`/orders/${id}`);
}
