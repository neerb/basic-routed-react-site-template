/**
 * ErrorBoundary — React class component that catches render errors.
 *
 * React's error boundary mechanism requires a class component with either
 * static getDerivedStateFromError() or componentDidCatch(). Function
 * components cannot be error boundaries.
 *
 * Wrap any subtree you want to isolate:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <MyFeature />
 *   </ErrorBoundary>
 *
 * If no fallback prop is provided, a default error message is rendered.
 * The onError prop allows callers to log errors to an external service.
 */

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * getDerivedStateFromError is called during the render phase when a
   * descendant throws. Updates state so the next render shows the fallback.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch is called after the error has been committed to the DOM.
   * Use it for side-effects like logging to an error-monitoring service.
   */
  componentDidCatch(error, info) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
    // In development, log the component stack for quick debugging.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] caught error:', error, info.componentStack);
    }
  }

  /** reset clears the error state, re-rendering the children. */
  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div role="alert" style={{ padding: '1rem', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.reset()}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
