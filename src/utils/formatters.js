/**
 * formatters — display formatting utilities for dates, numbers, and text.
 *
 * All functions are pure and side-effect free. They are designed to be used
 * directly in JSX: <p>{formatDate(user.createdAt)}</p>.
 *
 * Locale defaults to the browser's navigator.language so the output matches
 * the user's regional settings automatically.
 */

const DEFAULT_LOCALE =
  typeof navigator !== 'undefined' ? navigator.language : 'en-US';

// ---------------------------------------------------------------------------
// Date formatters
// ---------------------------------------------------------------------------

/**
 * formatDate formats an ISO-8601 timestamp as a locale-aware date string.
 *
 * @param {string | Date} value
 * @param {Intl.DateTimeFormatOptions} [opts]
 * @returns {string}
 */
export function formatDate(value, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, opts).format(new Date(value));
  } catch {
    return String(value);
  }
}

/**
 * formatDateTime formats an ISO-8601 timestamp as a locale-aware
 * date + time string.
 *
 * @param {string | Date} value
 * @returns {string}
 */
export function formatDateTime(value) {
  return formatDate(value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * formatRelativeTime returns a human-friendly relative time string
 * (e.g. "3 minutes ago", "in 2 hours").
 *
 * @param {string | Date} value
 * @returns {string}
 */
export function formatRelativeTime(value) {
  if (!value) return '—';
  const diff = (new Date(value) - Date.now()) / 1000; // seconds
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

  const thresholds = [
    { unit: 'year',   seconds: 31_536_000 },
    { unit: 'month',  seconds: 2_592_000 },
    { unit: 'week',   seconds: 604_800 },
    { unit: 'day',    seconds: 86_400 },
    { unit: 'hour',   seconds: 3_600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of thresholds) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }

  return rtf.format(0, 'second');
}

// ---------------------------------------------------------------------------
// Number formatters
// ---------------------------------------------------------------------------

/**
 * formatNumber formats a number with locale-aware thousands separators.
 *
 * @param {number} value
 * @param {Intl.NumberFormatOptions} [opts]
 * @returns {string}
 */
export function formatNumber(value, opts = {}) {
  if (value == null) return '—';
  return new Intl.NumberFormat(DEFAULT_LOCALE, opts).format(value);
}

/**
 * formatCurrency formats a number as a currency string.
 *
 * @param {number} value
 * @param {string} [currency] - ISO 4217 code, default 'USD'.
 * @returns {string}
 */
export function formatCurrency(value, currency = 'USD') {
  return formatNumber(value, { style: 'currency', currency });
}

/**
 * formatPercent formats a fraction (0–1) as a percentage string.
 *
 * @param {number} value  - Value between 0 and 1.
 * @param {number} [digits] - Decimal digits.
 * @returns {string}
 */
export function formatPercent(value, digits = 0) {
  if (value == null) return '—';
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Text formatters
// ---------------------------------------------------------------------------

/**
 * truncate shortens a string to maxLen characters and appends an ellipsis.
 *
 * @param {string} value
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(value, maxLen = 100) {
  if (!value || value.length <= maxLen) return value ?? '';
  return `${value.slice(0, maxLen).trimEnd()}…`;
}

/**
 * initials extracts up to two uppercase initials from a display name.
 *
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
