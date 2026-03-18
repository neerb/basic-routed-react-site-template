/**
 * Login page — email + password form with client-side validation.
 *
 * After a successful login, the user is redirected to the location they
 * originally tried to access (stored in router state by ProtectedRoute),
 * or to /dashboard as the default destination.
 *
 * Demonstrates:
 *   - FormField with validation errors
 *   - useAuth().login()
 *   - useNavigate + location state for post-auth redirect
 *   - Loading state on the submit button
 *   - Inline error message from the server (wrong credentials, etc.)
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { FormField } from '../components/FormField.jsx';
import { Button } from '../components/Button.jsx';
import { validate, email as emailValidator, required, minLength } from '../utils/validators.js';
import { getErrorMessage } from '../utils/errorHandler.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  // The protected route stores the original destination in location.state.from.
  const from = location.state?.from?.pathname ?? '/dashboard';

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the field error as the user types.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validateForm() {
    const next = {
      email:    validate(form.email,    [required, emailValidator]),
      password: validate(form.password, [(v) => required(v, 'Password'), (v) => minLength(v, 8)]),
    };
    setErrors(next);
    return Object.values(next).every((e) => e === null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Sign in</h1>

      {submitError && (
        <p role="alert" style={{ color: '#dc2626', marginBottom: '1rem' }}>
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
        <Button type="submit" loading={loading} style={{ width: '100%' }}>
          Sign in
        </Button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}
