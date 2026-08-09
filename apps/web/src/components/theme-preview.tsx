'use client';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { ACCENT_META } from '@/lib/theme';

const PRIORITIES = [
  { label: 'Urgent', className: 'text-priority-urgent' },
  { label: 'High', className: 'text-priority-high' },
  { label: 'Medium', className: 'text-priority-medium' },
  { label: 'Low', className: 'text-priority-low' },
  { label: 'No Priority', className: 'text-priority-none' },
];

/**
 * Development-only surface for eyeballing the theme tokens. Delete once the
 * real views exist — it is here so the 12 combinations can be checked against
 * the Figma frames on day 2 rather than day 12.
 */
export function ThemePreview() {
  const { mode, accent } = useTheme();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Current theme:{' '}
          <span className="font-medium text-card-foreground">
            {mode} / {ACCENT_META[accent].label}
          </span>{' '}
          — switch from the user menu in the sidebar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Add Task</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Leave Workspace</Button>
        <Button variant="link">Terms of Service</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Priority scale</h2>
          <ul className="space-y-1 text-sm">
            {PRIORITIES.map((p) => (
              <li key={p.label} className={p.className}>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Surfaces</h2>
          <div className="space-y-2 text-xs">
            <div className="rounded-md bg-background p-2">background</div>
            <div className="rounded-md bg-muted p-2 text-muted-foreground">muted</div>
            <div className="rounded-md bg-secondary p-2 text-secondary-foreground">secondary</div>
            <div className="rounded-md bg-accent-subtle p-2">accent-subtle</div>
            <div className="rounded-md bg-accent-solid p-2 text-accent-foreground">accent-solid</div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-medium">Typography</h2>
          <p className="text-xl font-semibold tracking-tight">Write API Documentation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create clear and detailed API documentation to guide developers.
          </p>
        </div>
      </div>
    </section>
  );
}
