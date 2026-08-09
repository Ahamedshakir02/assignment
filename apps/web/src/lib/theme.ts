/**
 * Theme is two independent values: a light/dark mode and an accent colour.
 * Both are written to a cookie so the server can render the correct classes on
 * <html> in the very first response — that is what prevents the flash of wrong
 * theme on load. localStorage is kept in sync purely as a client-side fallback.
 */

export const THEME_MODES = ['light', 'dark'] as const;
export const ACCENTS = ['amber', 'blue', 'pink', 'rose', 'emerald', 'black'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];
export type Accent = (typeof ACCENTS)[number];

export interface ThemePreference {
  mode: ThemeMode;
  accent: Accent;
}

export const DEFAULT_THEME: ThemePreference = { mode: 'light', accent: 'blue' };

export const THEME_COOKIE = 'pyramid_theme';
export const THEME_STORAGE_KEY = 'pyramid_theme';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Human-readable labels and swatches for the Color Mode menu. */
export const ACCENT_META: Record<Accent, { label: string; swatch: string }> = {
  amber: { label: 'Amber', swatch: '#f59e0b' },
  blue: { label: 'Blue', swatch: '#2563eb' },
  pink: { label: 'Pink', swatch: '#ec4899' },
  rose: { label: 'Rose', swatch: '#f43f5e' },
  emerald: { label: 'Emerald', swatch: '#059669' },
  black: { label: 'Black', swatch: '#171717' },
};

function isMode(value: unknown): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}

function isAccent(value: unknown): value is Accent {
  return ACCENTS.includes(value as Accent);
}

/** Cookie value is `mode:accent`, e.g. "dark:emerald". */
export function serializeTheme({ mode, accent }: ThemePreference): string {
  return `${mode}:${accent}`;
}

export function parseTheme(raw: string | undefined | null): ThemePreference {
  if (!raw) return DEFAULT_THEME;

  const [mode, accent] = raw.split(':');
  return {
    mode: isMode(mode) ? mode : DEFAULT_THEME.mode,
    accent: isAccent(accent) ? accent : DEFAULT_THEME.accent,
  };
}

/** Client-side write. Applies to the DOM immediately, then persists. */
export function applyTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', theme.mode === 'dark');
  root.dataset.accent = theme.accent;
  root.style.colorScheme = theme.mode;

  const value = serializeTheme(theme);
  document.cookie = `${THEME_COOKIE}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    // Private browsing can throw on write. The cookie is the source of truth,
    // so failing here is not worth surfacing.
  }
}
