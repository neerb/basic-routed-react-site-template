/**
 * NotFound — 404 page rendered when no route matches.
 *
 * Rendered by the catch-all <Route path="*"> in App.jsx.
 * Provides a link back to the home page to help users recover.
 */

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '6rem', margin: 0, lineHeight: 1 }}>404</h1>
      <h2>Page not found</h2>
      <p style={{ color: '#6b7280', maxWidth: '30ch' }}>
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.5rem 1.25rem',
          background: 'var(--color-primary, #2563eb)',
          color: '#fff',
          borderRadius: '0.375rem',
          textDecoration: 'none',
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
