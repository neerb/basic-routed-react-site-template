/**
 * userService — CRUD operations for the /users resource.
 *
 * All functions return promises that resolve to JSON bodies returned by the
 * API. Callers should wrap usage in try/catch to handle ApiError / NetworkError
 * raised by the underlying apiClient.
 */

import * as api from './apiClient.js';

// ---------------------------------------------------------------------------
// Types (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {object} User
 * @property {string}  id          - UUID.
 * @property {string}  email       - User's email address.
 * @property {string}  displayName - Display name shown in the UI.
 * @property {string}  role        - 'admin' | 'member' | 'viewer'.
 * @property {string}  createdAt   - ISO-8601 timestamp.
 * @property {string}  updatedAt   - ISO-8601 timestamp.
 */

/**
 * @typedef {object} CreateUserPayload
 * @property {string} email
 * @property {string} displayName
 * @property {string} password     - Plain-text password; hashed server-side.
 * @property {string} [role]       - Defaults to 'member'.
 */

/**
 * @typedef {object} UpdateUserPayload
 * @property {string} [displayName]
 * @property {string} [role]
 */

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------

/**
 * listUsers fetches a paginated list of users.
 *
 * @param {{ page?: number, limit?: number }} [params]
 * @returns {Promise<{ users: User[], total: number, page: number }>}
 */
export async function listUsers({ page = 1, limit = 20 } = {}) {
  return api.get(`/users?page=${page}&limit=${limit}`);
}

/**
 * getUser fetches a single user by ID.
 *
 * @param {string} id
 * @returns {Promise<User>}
 */
export async function getUser(id) {
  if (!id) throw new Error('getUser: id is required');
  return api.get(`/users/${id}`);
}

/**
 * createUser registers a new user.
 *
 * @param {CreateUserPayload} payload
 * @returns {Promise<User>}
 */
export async function createUser(payload) {
  validateCreatePayload(payload);
  return api.post('/users', payload);
}

/**
 * updateUser applies a partial update to an existing user.
 *
 * @param {string}            id
 * @param {UpdateUserPayload} payload
 * @returns {Promise<User>}
 */
export async function updateUser(id, payload) {
  if (!id) throw new Error('updateUser: id is required');
  return api.patch(`/users/${id}`, payload);
}

/**
 * deleteUser permanently removes a user account.
 *
 * @param {string} id
 * @returns {Promise<null>}
 */
export async function deleteUser(id) {
  if (!id) throw new Error('deleteUser: id is required');
  return api.del(`/users/${id}`);
}

/**
 * getCurrentUser returns the profile of the authenticated user.
 *
 * @returns {Promise<User>}
 */
export async function getCurrentUser() {
  return api.get('/users/me');
}

// ---------------------------------------------------------------------------
// Validation helpers (input boundary — do not trust caller input)
// ---------------------------------------------------------------------------

function validateCreatePayload(payload) {
  if (!payload?.email) throw new Error('createUser: email is required');
  if (!payload?.displayName) throw new Error('createUser: displayName is required');
  if (!payload?.password) throw new Error('createUser: password is required');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(payload.email)) {
    throw new Error('createUser: invalid email format');
  }

  if (payload.password.length < 8) {
    throw new Error('createUser: password must be at least 8 characters');
  }
}
