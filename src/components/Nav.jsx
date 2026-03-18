import { NavLink } from 'react-router-dom';
import './Nav.css';

/**
 * Nav — application top navigation bar.
 *
 * Uses NavLink from react-router-dom so the active route link receives
 * the "active" class automatically, enabling the active indicator style
 * defined in Nav.css.
 *
 * Public links are always visible. Authenticated-only links (Dashboard,
 * Profile) are included here for simplicity; in a production app you would
 * conditionally render them based on useAuth().isAuthenticated.
 */
export default function Nav() {
  return (
    <nav>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/about">About</NavLink>
      <NavLink to="/settings">Settings</NavLink>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/login">Login</NavLink>
    </nav>
  );
}
