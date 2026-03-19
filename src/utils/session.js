/**
 * session — browser session identity for cart and order association.
 *
 * Generates a UUID v4 on first call and persists it to localStorage.
 * All shop API requests include this ID in the X-Session-ID header so the
 * backend can associate carts and orders with the current browser session
 * without requiring authentication.
 */

const SESSION_KEY = 'shop_session_id';

/**
 * getSessionId returns the persistent browser session ID.
 * Creates and stores a new UUID when none exists.
 *
 * @returns {string}
 */
export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
