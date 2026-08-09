'use client';

import { PanelLeft } from 'lucide-react';
import { useSidebar } from './sidebar-context';

interface PageHeaderProps {
  title: string;
  breadcrumb?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Sticky page header: title on the left, toolbar on the right. The toolbar
 * wraps to its own line on narrow screens rather than squeezing the title.
 */
export function PageHeader({ title, breadcrumb, children }: PageHeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur">
      <div className="flex h-12 items-center gap-2 border-b px-4 md:px-6">
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="-ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
        {breadcrumb}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-4 md:px-6">
        <h1 className="mr-auto text-xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </header>
  );
}
