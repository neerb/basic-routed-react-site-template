/**
 * Profile page — displays and allows editing of the authenticated user's profile.
 *
 * Demonstrates:
 *   - useApi() for initial data load (getCurrentUser)
 *   - useApi() for mutation (updateUser) — separate hook instance per operation
 *   - Optimistic local state update before the server confirms
 *   - Modal for confirming destructive actions
 *   - formatDate / initials utilities
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useApi } from '../hooks/useApi.js';
import { getCurrentUser, updateUser } from '../services/userService.js';
import { FormField } from '../components/FormField.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { formatDate, initials } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/errorHandler.js';
import { validate, required, maxLength } from '../utils/validators.js';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { data: profile, loading, error, execute: loadProfile } = useApi(getCurrentUser);
  const { loading: saving, execute: saveProfile } = useApi(updateUser);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ displayName: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load profile on mount.
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Sync form when profile data arrives.
  useEffect(() => {
    if (profile) {
      setForm({ displayName: profile.displayName });
    }
  }, [profile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError(null);

    const errs = {
      displayName: validate(form.displayName, [
        (v) => required(v, 'Display name'),
        (v) => maxLength(v, 60),
      ]),
    };
    setFormErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    try {
      await saveProfile(profile.id, form);
      setEditMode(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <p role="alert" style={{ color: '#dc2626' }}>{getErrorMessage(error)}</p>
      </main>
    );
  }
  if (!profile) return null;

  return (
    <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Avatar name={profile.displayName} />
        <div>
          <h1 style={{ margin: 0 }}>{profile.displayName}</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>{profile.email}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
            Member since {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      {editMode ? (
        <form onSubmit={handleSave}>
          {saveError && (
            <p role="alert" style={{ color: '#dc2626' }}>{saveError}</p>
          )}
          <FormField
            label="Display name"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            error={formErrors.displayName}
            required
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" loading={saving}>Save changes</Button>
            <Button variant="secondary" type="button" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setEditMode(true)}>
          Edit profile
        </Button>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Account</h2>
        <p>Role: <strong>{profile.role}</strong></p>
        <Button variant="danger" onClick={() => setShowLogoutModal(true)}>
          Sign out
        </Button>
      </section>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign out?"
      >
        <p>Are you sure you want to sign out?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={logout}>
            Sign out
          </Button>
        </div>
      </Modal>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Avatar sub-component
// ---------------------------------------------------------------------------

function Avatar({ name, size = 64 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-primary, #2563eb)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
