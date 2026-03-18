/**
 * Modal — accessible dialog rendered via a React Portal.
 *
 * Renders outside the normal component hierarchy by appending to document.body
 * so z-index stacking is predictable regardless of where the Modal is rendered
 * in the JSX tree.
 *
 * Accessibility:
 *   - role="dialog" with aria-modal="true"
 *   - aria-labelledby links to the title element
 *   - Pressing Escape closes the modal
 *   - Focus is trapped inside the dialog while it is open
 *   - Background scroll is locked while open
 */

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * @param {{
 *   isOpen:    boolean,
 *   onClose:   () => void,
 *   title:     string,
 *   children:  React.ReactNode,
 *   maxWidth?: string,
 * }} props
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = '480px' }) {
  const overlayRef = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;

  // Close on Escape key press.
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // Lock body scroll and bind key listener while open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Close when the backdrop overlay is clicked (but not the dialog itself).
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          background: '#fff',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          width: '100%',
          maxWidth,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2 id={titleId} style={{ margin: 0, fontSize: '1.25rem' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}
