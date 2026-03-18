/**
 * LoadingSpinner — accessible full-screen (or inline) loading indicator.
 *
 * Renders an animated SVG spinner. The `size` prop controls the diameter
 * in pixels. The `fullScreen` prop centres the spinner in the viewport using
 * a fixed overlay — useful for page-level loading states.
 *
 * Accessibility: the container has role="status" and an sr-only text label
 * so screen readers announce the loading state.
 */

export function LoadingSpinner({ size = 40, fullScreen = false, label = 'Loading…' }) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeDasharray="80 20"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
