/**
 * apiClient — base HTTP client for all API calls.
 *
 * Wraps fetch() with consistent error handling, JSON serialisation,
 * auth-token injection, and a retry strategy for transient failures.
 * All services in src/services/ should import from this module rather
 * than calling fetch directly.
 */

// In development Vite proxies /api/* → localhost:8080/api/* (see vite.config.js).
// Override with VITE_API_BASE_URL for production deployments.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Maximum number of retries for network-level failures (not 4xx/5xx).
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------

/** Raised when the server returns an HTTP error status (4xx / 5xx). */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Raised when the request times out or the network is unreachable. */
export class NetworkError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

let _authToken = null;

/** Set the bearer token used for all subsequent requests. */
export function setAuthToken(token) {
  _authToken = token;
}

/** Clear the stored auth token (call on logout). */
export function clearAuthToken() {
  _authToken = null;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

/**
 * request performs a fetch call with automatic JSON parsing, error
 * normalisation, and retry logic.
 *
 * @param {string} method - HTTP verb (GET, POST, PUT, PATCH, DELETE).
 * @param {string} path   - Path relative to BASE_URL.
 * @param {object} [body] - Request body, serialised to JSON if provided.
 * @param {object} [opts] - Additional fetch options.
 * @returns {Promise<any>} Parsed JSON response body.
 * @throws {ApiError} on HTTP error responses.
 * @throws {NetworkError} on network-level failures after all retries.
 */
async function request(method, path, body, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...opts.headers,
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const init = {
    method,
    headers,
    ...opts,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAY_MS * attempt);
    }

    try {
      const res = await fetch(url, init);

      if (!res.ok) {
        let errBody = null;
        try {
          errBody = await res.json();
        } catch {
          // ignore parse errors on error responses
        }
        throw new ApiError(
          errBody?.message ?? `HTTP ${res.status}: ${res.statusText}`,
          res.status,
          errBody,
        );
      }

      // 204 No Content — return null without attempting JSON parse.
      if (res.status === 204) return null;

      return await res.json();
    } catch (err) {
      if (err instanceof ApiError) {
        // Do not retry client or server errors — propagate immediately.
        throw err;
      }
      lastError = new NetworkError(
        `Network error on ${method} ${path} (attempt ${attempt + 1})`,
        err,
      );
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

/** GET request — no body. */
export const get = (path, opts) => request('GET', path, undefined, opts);

/** POST request with JSON body. */
export const post = (path, body, opts) => request('POST', path, body, opts);

/** PUT request with JSON body. */
export const put = (path, body, opts) => request('PUT', path, body, opts);

/** PATCH request with JSON body. */
export const patch = (path, body, opts) => request('PATCH', path, body, opts);

/** DELETE request — no body. */
export const del = (path, opts) => request('DELETE', path, undefined, opts);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
