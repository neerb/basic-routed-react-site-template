/**
 * Dashboard page — protected route that displays a summary of user data.
 *
 * Demonstrates the standard page pattern:
 *   1. useApi() to fetch data on mount
 *   2. Loading / error / data tri-state rendering
 *   3. useAuth() to access the current user
 *   4. ErrorBoundary wrapping for render-phase error isolation
 */

import { useEffect } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { listUsers } from '../services/userService.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { formatDate, formatNumber } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, execute } = useApi(listUsers);

  // Fetch users when the component mounts.
  useEffect(() => {
    execute({ page: 1, limit: 20 });
  }, [execute]);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome back, <strong>{user?.displayName ?? 'there'}</strong>.</p>

      <section aria-labelledby="users-heading">
        <h2 id="users-heading">Users</h2>

        {loading && <LoadingSpinner />}

        {error && (
          <p role="alert" style={{ color: '#dc2626' }}>
            {getErrorMessage(error)}
          </p>
        )}

        {data && !loading && (
          <>
            <p>Total: {formatNumber(data.total)}</p>
            <ErrorBoundary>
              <UserTable users={data.users} />
            </ErrorBoundary>
          </>
        )}
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (co-located because they are only used on this page)
// ---------------------------------------------------------------------------

function UserTable({ users }) {
  if (!users?.length) {
    return <p>No users found.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Role</th>
          <th style={thStyle}>Joined</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </tbody>
    </table>
  );
}

function UserRow({ user }) {
  return (
    <tr>
      <td style={tdStyle}>{user.displayName}</td>
      <td style={tdStyle}>{user.email}</td>
      <td style={tdStyle}>{user.role}</td>
      <td style={tdStyle}>{formatDate(user.createdAt)}</td>
    </tr>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #e5e7eb',
};
