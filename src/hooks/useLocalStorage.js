/**
 * useLocalStorage — synchronises a state value with localStorage.
 *
 * Behaves identically to useState but persists the value across page refreshes.
 * The stored value is serialised with JSON.stringify and deserialised on read.
 * Errors during deserialisation (e.g. corrupted data) fall back to the
 * provided initialValue so the application remains functional.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */

import { useState, useCallback } from 'react';

/**
 * @template T
 * @param {string} key          - localStorage key.
 * @param {T}      initialValue - Fallback value if the key is not yet set.
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]}
 *          [storedValue, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => readFromStorage(key, initialValue));

  /**
   * setValue persists the new value (or the result of a functional updater)
   * to both localStorage and component state.
   */
  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.error(`useLocalStorage: failed to write key "${key}"`, err);
        }
        return next;
      });
    },
    [key],
  );

  /**
   * removeValue deletes the key from localStorage and resets state to the
   * original initialValue.
   */
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`useLocalStorage: failed to remove key "${key}"`, err);
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function readFromStorage(key, initialValue) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : initialValue;
  } catch {
    // Corrupted value — fall back silently.
    return initialValue;
  }
}
