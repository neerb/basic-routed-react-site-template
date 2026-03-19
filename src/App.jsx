import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import './App.css';

/**
 * App — root component.
 *
 * Provider order (outermost → innermost):
 *   AuthProvider   — authentication state
 *   ThemeProvider  — colour scheme
 *   CartProvider   — shopping cart state (requires session from localStorage,
 *                    not auth, so it lives outside ProtectedRoute)
 *
 * Route structure:
 *   /           — Home
 *   /about      — About
 *   /settings   — Settings
 *   /login      — Login
 *   /shop       — Product catalogue
 *   /shop/:id   — Product detail
 *   /cart       — Shopping cart
 *   /checkout   — Checkout form
 *   /orders/:id — Order confirmation
 *   /dashboard  — Dashboard  (protected)
 *   /profile    — User profile (protected)
 *   *           — 404
 */
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Nav />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />

            {/* Shop routes */}
            <Route path="/shop" element={<Products />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders/:id" element={<OrderConfirmation />} />

            {/* Protected routes */}
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
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
