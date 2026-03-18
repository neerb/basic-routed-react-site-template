import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

/**
 * App — root component.
 *
 * Wraps the entire component tree in AuthProvider and ThemeProvider so that
 * any descendent can access authentication state (useAuth) and theme state
 * (useTheme) without prop-drilling.
 *
 * Route structure:
 *   /           — Home (public)
 *   /about      — About (public)
 *   /settings   — Settings (public)
 *   /login      — Login form (public; redirects if already authenticated)
 *   /dashboard  — Dashboard (protected)
 *   /profile    — User profile (protected)
 *   *           — 404 Not Found
 */
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Nav />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes — redirect to /login when unauthenticated */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
