/**
 * errorHandler — centralised error classification and reporting utilities.
 *
 * All API calls propagate errors as ApiError or NetworkError from apiClient.
 * This module provides helpers for:
 *   1. Classifying errors so UI components can render appropriate messages.
 *   2. Extracting user-friendly messages from raw error objects.
 *   3. Reporting errors to an external monitoring service (placeholder).
 *
 * Error handling pattern used across this codebase:
 *   try {
 *     await someApiCall();
 *   } catch (err) {
 *     const msg = getErrorMessage(err);
 *     setError(msg);
 *     reportError(err, { context: 'ComponentName.operation' });
 *   }
 */

import { ApiError, NetworkError } from '../services/apiClient.js';

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/** @typedef {'auth' | 'not_found' | 'validation' | 'server' | 'network' | 'unknown'} ErrorKind */

/**
 * classifyError maps an error to a semantic kind that UI components can
 * switch on to render an appropriate message or take a specific action.
 *
 * @param {unknown} err
 * @returns {ErrorKind}
 */
export function classifyError(err) {
  if (err instanceof NetworkError) return 'network';

  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return 'auth';
    if (err.status === 404) return 'not_found';
    if (err.status === 422 || err.status === 400) return 'validation';
    if (err.status >= 500) return 'server';
  }

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Message extraction
// ---------------------------------------------------------------------------

const KIND_MESSAGES = {
  auth:       'You are not authorised to perform this action. Please sign in and try again.',
  not_found:  'The requested resource could not be found.',
  validation: 'Please check your input and try again.',
  server:     'An unexpected server error occurred. Our team has been notified.',
  network:    'Unable to reach the server. Please check your connection and try again.',
  unknown:    'An unexpected error occurred.',
};

/**
 * getErrorMessage returns the best available human-readable message for an error,
 * falling back to the kind-level default if no specific message is available.
 *
 * @param {unknown} err
 * @returns {string}
 */
export function getErrorMessage(err) {
  // ApiError may carry a structured body with a server-provided message.
  if (err instanceof ApiError && err.body?.message) {
    return err.body.message;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return KIND_MESSAGES[classifyError(err)];
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

/**
 * reportError logs an error to the configured monitoring service.
 * In development, errors are printed to the console.
 * In production, replace this stub with calls to Sentry, Datadog, etc.
 *
 * @param {unknown}  err
 * @param {object}   [context] - Additional metadata to attach to the report.
 */
export function reportError(err, context = {}) {
  if (import.meta.env.DEV) {
    console.error('[errorHandler] reported error:', err, context);
    return;
  }

  // Production: forward to monitoring service.
  // Example Sentry integration:
  // Sentry.captureException(err, { extra: context });
}

// ---------------------------------------------------------------------------
// Convenience: is* predicates
// ---------------------------------------------------------------------------

export const isAuthError     = (err) => classifyError(err) === 'auth';
export const isNotFoundError = (err) => classifyError(err) === 'not_found';
export const isNetworkError  = (err) => classifyError(err) === 'network';
export const isServerError   = (err) => classifyError(err) === 'server';
