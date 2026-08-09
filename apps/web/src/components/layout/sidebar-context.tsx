'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface SidebarContextValue {
  open: boolean;
  isMobile: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const MOBILE_BREAKPOINT = 768;

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Starts open, matching the desktop design. The mobile effect below closes
  // it as soon as we know the viewport is narrow.
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    function apply(matches: boolean) {
      setIsMobile(matches);
      setOpen(!matches);
    }

    apply(query.matches);
    const listener = (e: MediaQueryListEvent) => apply(e.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        open,
        isMobile,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}
