/**
 * FormField — labelled input with inline validation error display.
 *
 * Wraps a <label>, an <input> (or <textarea>/<select>), and an error
 * message element into a single composable unit. Validation errors are
 * announced to screen readers via aria-describedby.
 *
 * Usage:
 *   <FormField
 *     label="Email"
 *     name="email"
 *     type="email"
 *     value={email}
 *     onChange={e => setEmail(e.target.value)}
 *     error={errors.email}
 *     required
 *   />
 */

import { useId } from 'react';

/**
 * @param {{
 *   label:       string,
 *   name:        string,
 *   type?:       string,
 *   value:       string,
 *   onChange:    (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   error?:      string | null,
 *   required?:   boolean,
 *   disabled?:   boolean,
 *   placeholder?: string,
 *   as?:         'input' | 'textarea' | 'select',
 *   children?:   React.ReactNode,  // options for as='select'
 * }} props
 */
export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  as: Tag = 'input',
  children,
}) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const inputProps = {
    id: inputId,
    name,
    value,
    onChange,
    required,
    disabled,
    placeholder,
    'aria-describedby': hasError ? errorId : undefined,
    'aria-invalid': hasError,
    style: {
      display: 'block',
      width: '100%',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      border: `1px solid ${hasError ? '#dc2626' : '#d1d5db'}`,
      outline: 'none',
      boxSizing: 'border-box',
    },
  };

  if (Tag === 'input') {
    inputProps.type = type;
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={inputId}
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
      >
        {label}
        {required && <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <Tag {...inputProps}>{children}</Tag>
      {hasError && (
        <p id={errorId} role="alert" style={{ margin: '0.25rem 0 0', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
