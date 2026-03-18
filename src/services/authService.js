/**
 * authService — handles authentication flows (login, logout, token refresh).
 *
 * Tokens are stored in localStorage so they survive page refreshes.
 * The access token is short-lived (15 min); the refresh token is long-lived
 * (7 days) and used by refreshAccessToken to obtain a new access token
 * without requiring the user to re-authenticate.
 *
 * Integration point: after a successful login or refresh, call
 * setAuthToken(accessToken) from apiClient so all subsequent requests include
 * the bearer token automatically.
 */

import * as api from './apiClient.js';
import { setAuthToken, clearAuthToken } from './apiClient.js';

const ACCESS_TOKEN_KEY = 'atlas_access_token';
const REFRESH_TOKEN_KEY = 'atlas_refresh_token';
const USER_KEY = 'atlas_user';

// ---------------------------------------------------------------------------
// Login / logout
// ---------------------------------------------------------------------------

/**
 * login authenticates a user with email and password.
 *
 * On success the access token is injected into apiClient and both tokens
 * are persisted to localStorage.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new Error('login: email and password are required');
  }

  const data = await api.post('/auth/login', { email, password });

  persistTokens(data.accessToken, data.refreshToken);
  persistUser(data.user);
  setAuthToken(data.accessToken);

  return data;
}

/**
 * logout clears stored credentials, revokes the refresh token server-side,
 * and removes the bearer token from apiClient.
 *
 * Errors during the revoke call are swallowed — the local state is cleared
 * regardless so the user is always logged out locally.
 */
export async function logout() {
  const refreshToken = getRefreshToken();
  clearLocalSession();
  clearAuthToken();

  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Best-effort revocation — do not block the logout flow.
    }
  }
}

/**
 * refreshAccessToken uses the stored refresh token to obtain a new access
 * token. Call this when an API request returns 401.
 *
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If no refresh token is stored or the server rejects it.
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('refreshAccessToken: no refresh token stored');
  }

  const data = await api.post('/auth/refresh', { refreshToken });

  persistTokens(data.accessToken, data.refreshToken ?? refreshToken);
  setAuthToken(data.accessToken);

  return data.accessToken;
}

// ---------------------------------------------------------------------------
// Session hydration (called on app init)
// ---------------------------------------------------------------------------

/**
 * hydrateSession restores auth state from localStorage on app startup.
 * Returns the stored user, or null if no session exists.
 *
 * @returns {{ user: object, accessToken: string } | null}
 */
export function hydrateSession() {
  const accessToken = getAccessToken();
  const user = getStoredUser();

  if (!accessToken || !user) return null;

  setAuthToken(accessToken);
  return { user, accessToken };
}

// ---------------------------------------------------------------------------
// Storage helpers (localStorage as system boundary)
// ---------------------------------------------------------------------------

function persistTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function persistUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearLocalSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Returns true if there is a stored access token (quick session check). */
export function isAuthenticated() {
  return Boolean(getAccessToken());
}
