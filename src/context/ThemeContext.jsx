/**
 * ThemeContext — application-wide colour-scheme / theme state.
 *
 * ThemeProvider stores the active theme ('light' | 'dark' | 'system') in
 * localStorage so the user's preference survives page refreshes.
 * The resolved theme (what the page actually renders) takes the OS preference
 * into account when the user chooses 'system'.
 *
 * Consumers call useTheme() from src/hooks/useTheme.js.
 */

import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

/** @typedef {'light' | 'dark' | 'system'} ThemeSetting */

export const ThemeContext = createContext(undefined);

/**
 * ThemeProvider wraps the application and injects the current theme as a
 * `data-theme` attribute on <html> so CSS variables can respond to it.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('app_theme', 'system');

  // Resolve the effective theme by checking the OS preference.
  const resolved = resolveTheme(theme);

  // Keep the <html> element in sync with the resolved theme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    resolvedTheme: resolved,
    setTheme,
    toggleTheme,
    isDark: resolved === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme returns the current ThemeContext value.
 * Throws if called outside a ThemeProvider tree.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function resolveTheme(setting) {
  if (setting !== 'system') return setting;
  // Read the OS preference from the media query.
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}
