/**
 * validators — pure functions for form field and data validation.
 *
 * All validators accept a value and return either null (valid) or a
 * human-readable error string. This makes them composable: pass them to
 * FormField error props or combine them in a validate() utility.
 *
 * Keeping validators as pure functions (no side-effects, no imports) makes
 * them trivially unit-testable without mocking.
 */

// ---------------------------------------------------------------------------
// Primitive validators
// ---------------------------------------------------------------------------

/**
 * required returns an error if the value is empty.
 *
 * @param {string} value
 * @param {string} [fieldName]
 * @returns {string | null}
 */
export function required(value, fieldName = 'This field') {
  return value?.trim() ? null : `${fieldName} is required.`;
}

/**
 * minLength returns an error if the trimmed value is shorter than min.
 *
 * @param {string} value
 * @param {number} min
 * @returns {string | null}
 */
export function minLength(value, min) {
  if (value?.trim().length >= min) return null;
  return `Must be at least ${min} characters.`;
}

/**
 * maxLength returns an error if the trimmed value exceeds max.
 *
 * @param {string} value
 * @param {number} max
 * @returns {string | null}
 */
export function maxLength(value, max) {
  if (!value || value.trim().length <= max) return null;
  return `Must be at most ${max} characters.`;
}

// ---------------------------------------------------------------------------
// Format validators
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * email validates an email address format.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function email(value) {
  if (!value) return null; // use required() for presence check
  return EMAIL_REGEX.test(value.trim()) ? null : 'Must be a valid email address.';
}

const URL_REGEX = /^https?:\/\/.+\..+/i;

/**
 * url validates that a value is a http/https URL.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function url(value) {
  if (!value) return null;
  return URL_REGEX.test(value.trim()) ? null : 'Must be a valid URL starting with http(s)://';
}

/**
 * password enforces basic password strength rules.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function password(value) {
  if (!value) return null;
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
  return null;
}

/**
 * passwordConfirm validates that a confirmation value matches the original.
 *
 * @param {string} value    - Confirmation field value.
 * @param {string} original - Original password value.
 * @returns {string | null}
 */
export function passwordConfirm(value, original) {
  return value === original ? null : 'Passwords do not match.';
}

// ---------------------------------------------------------------------------
// Composite validator
// ---------------------------------------------------------------------------

/**
 * validate runs an array of validator functions against a value, returning
 * the first error encountered (fail-fast) or null if all pass.
 *
 * @param {string}                      value
 * @param {Array<(v: string) => string | null>} validators
 * @returns {string | null}
 */
export function validate(value, validators) {
  for (const fn of validators) {
    const err = fn(value);
    if (err !== null) return err;
  }
  return null;
}
