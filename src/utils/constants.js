/**
 * constants — application-wide constant values.
 *
 * Centralising constants here prevents magic strings and numbers from being
 * scattered across components. Import the relevant subset rather than
 * importing * to keep bundle analysis accurate.
 */

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export const ROUTES = {
  HOME:      '/',
  ABOUT:     '/about',
  SETTINGS:  '/settings',
  DASHBOARD: '/dashboard',
  LOGIN:     '/login',
  PROFILE:   '/profile',
  NOT_FOUND: '*',
};

// ---------------------------------------------------------------------------
// User roles
// ---------------------------------------------------------------------------

export const ROLES = {
  ADMIN:  'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------

export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
};

// ---------------------------------------------------------------------------
// Debounce delays (milliseconds)
// ---------------------------------------------------------------------------

export const DEBOUNCE = {
  SEARCH:    400,
  AUTOSAVE:  1000,
  RESIZE:    200,
};

// ---------------------------------------------------------------------------
// Toast / notification durations (milliseconds)
// ---------------------------------------------------------------------------

export const TOAST_DURATION = {
  SHORT:   2500,
  MEDIUM:  4000,
  LONG:    7000,
};

// ---------------------------------------------------------------------------
// Local storage keys — single source of truth to avoid key collisions
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'atlas_access_token',
  REFRESH_TOKEN: 'atlas_refresh_token',
  USER:          'atlas_user',
  THEME:         'app_theme',
  SIDEBAR_OPEN:  'sidebar_open',
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const API = {
  TIMEOUT_MS: 10_000,
  MAX_RETRIES: 2,
};
