/**
 * AuthContext — application-wide authentication state.
 *
 * AuthProvider wraps the component tree and exposes:
 *   user            — the currently signed-in user, or null.
 *   isAuthenticated — boolean derived from user !== null.
 *   loading         — true while the initial session hydration is in flight.
 *   login(email, password) — authenticates and sets user state.
 *   logout()               — clears credentials and resets user state.
 *
 * Consumers should import useAuth() from src/hooks/useAuth.js rather than
 * consuming AuthContext directly.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(undefined);

/**
 * AuthProvider must wrap any part of the tree that calls useAuth().
 * Typically placed at the root of the application in main.jsx.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore the session from localStorage if a valid token exists.
  useEffect(() => {
    const session = authService.hydrateSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  /**
   * login authenticates the user, updates state, and persists tokens.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
  }, []);

  /**
   * logout clears local session state and revokes the refresh token.
   *
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: user !== null,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
