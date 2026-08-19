'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  applyTheme,
  DEFAULT_THEME,
  type Accent,
  type ThemeMode,
  type ThemePreference,
} from '@/lib/theme';

interface ThemeContextValue extends ThemePreference {
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * The initial value comes from the server (read from the cookie in the root
 * layout), so there is no read-then-correct on mount and therefore no flash.
 */
export function ThemeProvider({
  initialTheme = DEFAULT_THEME,
  children,
}: {
  initialTheme?: ThemePreference;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);

  const update = useCallback((next: ThemePreference) => {
    setTheme(next);
    applyTheme(next);
    // Best-effort sync to the server so the preference follows the account,
    // not just the browser. A failure here is not user-facing: the cookie has
    // already been written, so the theme is correct either way — this includes
    // the logged-out case on /login, where the request 401s and is ignored.
    void api
      .patch('/users/me/preferences', {
        themeMode: next.mode.toUpperCase(),
        accent: next.accent.toUpperCase(),
      })
      .catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...theme,
      setMode: (mode) => update({ ...theme, mode }),
      setAccent: (accent) => update({ ...theme, accent }),
    }),
    [theme, update],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
