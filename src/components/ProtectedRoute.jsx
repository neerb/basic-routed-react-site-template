/**
 * ProtectedRoute — renders children only when the user is authenticated.
 *
 * Place this around any <Route> that requires a signed-in user:
 *
 *   <Route
 *     path="/dashboard"
 *     element={
 *       <ProtectedRoute>
 *         <Dashboard />
 *       </ProtectedRoute>
 *     }
 *   />
 *
 * Unauthenticated users are redirected to /login. The original location is
 * stored in router state so the login page can redirect back after a
 * successful sign-in.
 *
 * While the initial session hydration is pending (loading === true), a
 * loading spinner is rendered to prevent a flash of the login page for
 * users who are already authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LoadingSpinner } from './LoadingSpinner.jsx';

/**
 * @param {{ children: React.ReactNode, redirectTo?: string }} props
 */
export function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Pass the attempted location so the login page can redirect back.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}
