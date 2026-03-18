/**
 * useApi — generic hook for executing async API calls with loading and error state.
 *
 * Provides a consistent pattern for data fetching across the application.
 * Handles the three states every async operation can be in: idle, loading,
 * and settled (success or error). The hook also tracks whether the component
 * is still mounted and cancels state updates after unmount to prevent the
 * "Can't perform a React state update on an unmounted component" warning.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(userService.getUser);
 *   useEffect(() => { execute(userId); }, [userId]);
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * @template T
 * @param {(...args: any[]) => Promise<T>} apiFn - The async function to call.
 * @returns {{
 *   data:    T | null,
 *   loading: boolean,
 *   error:   Error | null,
 *   execute: (...args: any[]) => Promise<T | undefined>,
 *   reset:   () => void,
 * }}
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track whether the component is still mounted so we don't queue state
  // updates after it has been removed from the tree.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * execute calls apiFn with the supplied arguments and updates state.
   * Returns the resolved value so callers can chain imperatively when needed.
   */
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args);
        if (mountedRef.current) {
          setData(result);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFn],
  );

  /** reset clears data and error, returning the hook to its initial state. */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
