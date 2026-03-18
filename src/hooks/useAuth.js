/**
 * useAuth — convenience hook for consuming the AuthContext.
 *
 * Components that need authentication state (current user, login, logout)
 * should import this hook rather than importing AuthContext directly.
 * Throws a descriptive error if called outside of an AuthProvider tree.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
