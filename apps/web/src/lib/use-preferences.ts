'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMe, useUpdatePreferences } from './queries';
import { DEFAULT_FIELDS, type FieldVisibility } from './types';

const STORAGE_KEY = 'pyramid_view_prefs';

interface ViewPreferences {
  view: 'LIST' | 'BOARD';
  fields: FieldVisibility;
}

const DEFAULTS: ViewPreferences = { view: 'LIST', fields: DEFAULT_FIELDS };

function readLocal(): ViewPreferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ViewPreferences>;
    return {
      view: parsed.view === 'BOARD' ? 'BOARD' : 'LIST',
      fields: { ...DEFAULT_FIELDS, ...(parsed.fields ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * View mode and column visibility. Read from localStorage on mount for an
 * instant, correct first paint, then reconciled with the server value so the
 * preference follows the account across devices.
 */
export function usePreferences() {
  const [prefs, setPrefs] = useState<ViewPreferences>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const { data: me } = useMe();
  const { mutate: persist } = useUpdatePreferences();

  // Deliberately after mount: localStorage is not available during SSR, and
  // reading it in render would desynchronise the server and client markup.
  useEffect(() => {
    setPrefs(readLocal());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !me) return;
    setPrefs((current) => ({
      view: me.viewMode ?? current.view,
      fields: { ...current.fields, ...(me.visibleFields ?? {}) } as FieldVisibility,
    }));
  }, [me, hydrated]);

  const update = useCallback(
    (next: Partial<ViewPreferences>) => {
      setPrefs((current) => {
        const merged = { ...current, ...next };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // Storage can be unavailable; the server copy is the durable one.
        }
        persist({ viewMode: merged.view, visibleFields: merged.fields });
        return merged;
      });
    },
    [persist],
  );

  return {
    view: prefs.view,
    fields: prefs.fields,
    setView: (view: 'LIST' | 'BOARD') => update({ view }),
    setFields: (fields: FieldVisibility) => update({ fields }),
  };
}

/** Debounce a fast-changing value — used to keep search off every keystroke. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
