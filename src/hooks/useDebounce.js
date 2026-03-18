/**
 * useDebounce — delays updating a value until it has not changed for the
 * specified wait period (in milliseconds).
 *
 * Useful for reducing the frequency of expensive operations triggered by
 * rapidly-changing input values, such as search queries and window resize
 * events.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 400);
 *   useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */

import { useState, useEffect } from 'react';

/**
 * @template T
 * @param {T}      value  - The value to debounce.
 * @param {number} delay  - Debounce delay in milliseconds.
 * @returns {T} The debounced value.
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if value or delay changes before the timeout fires,
    // restarting the debounce window from zero.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
