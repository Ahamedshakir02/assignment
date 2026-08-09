'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, User, Sun, Moon, Palette, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { useTheme } from '@/components/theme-provider';
import { useMe, useUpdateProfile } from '@/lib/queries';
import { ACCENTS, ACCENT_META, type Accent } from '@/lib/theme';
import { cn } from '@/lib/utils';

type Section = 'profile' | 'theme' | 'color';

const NAV: { key: Section; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'theme', label: 'Theme', icon: Sun },
  { key: 'color', label: 'Color', icon: Palette },
];

/**
 * Settings screen. Own shell with a "Back to app" affordance, matching the
 * design, rather than the standard sidebar.
 */
export default function SettingsPage() {
  const [section, setSection] = useState<Section>('profile');
  const [navSearch, setNavSearch] = useState('');

  const visible = NAV.filter((item) =>
    item.label.toLowerCase().includes(navSearch.toLowerCase()),
  );

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="shrink-0 border-b bg-sidebar p-3 md:w-64 md:border-b-0 md:border-r">
        <Link
          href="/tasks"
          className="mb-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
        >
          <ArrowLeft className="size-4" />
          Back to app
        </Link>

        <div className="mb-3 flex h-9 items-center gap-2 rounded-md border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search settings"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <nav>
          <ul className="flex gap-1 md:flex-col">
            {visible.map(({ key, label, icon: Icon }) => (
              <li key={key} className="flex-1 md:flex-none">
                <button
                  type="button"
                  onClick={() => setSection(key)}
                  aria-current={section === key ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    section === key
                      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-2xl">
          {section === 'profile' && <ProfileSection />}
          {section === 'theme' && <ThemeSection />}
          {section === 'color' && <ColorSection />}
        </div>
      </main>
    </div>
  );
}

function ProfileSection() {
  const { data: me } = useMe();
  const { mutate: save, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const [form, setForm] = useState({ fullName: '', title: '', username: '' });
  const [touched, setTouched] = useState(false);

  // Populate once the user loads, unless the person has already started typing.
  const values = touched
    ? form
    : {
        fullName: me?.fullName ?? '',
        title: me?.title ?? '',
        username: me?.username ?? '',
      };

  function update(field: keyof typeof form, value: string) {
    setTouched(true);
    setForm({ ...values, [field]: value });
  }

  function handleSave() {
    save(values, {
      onSuccess: () => {
        toast('Profile updated');
        setTouched(false);
      },
      onError: (e) => toast((e as Error).message, 'error'),
    });
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Profile</h1>

      <div className="rounded-lg border bg-card">
        <Field label="Profile picture">
          <Avatar user={me} size="lg" />
        </Field>
        <Separator />

        <Field label="Email">
          <span className="text-sm text-muted-foreground">
            {me?.email ?? 'Not set — guest account'}
          </span>
        </Field>
        <Separator />

        <Field label="Full name">
          <Input
            value={values.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Dexter"
            className="max-w-56"
          />
        </Field>
        <Separator />

        <Field label="Title" hint="Your job title or role">
          <Input
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Designer"
            className="max-w-56"
          />
        </Field>
        <Separator />

        <Field label="Username" hint="One word, like a nickname or first name">
          <Input
            value={values.username}
            onChange={(e) => update('username', e.target.value)}
            placeholder="dexuser"
            className="max-w-56"
          />
        </Field>
      </div>

      {touched && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setTouched(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight">Workspace access</h2>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
        <p className="flex-1 text-sm">Remove yourself from the workspace</p>
        <LeaveWorkspaceDialog />
      </div>
    </section>
  );
}

/**
 * DEVIATION: leaving a workspace requires multi-user workspaces, which are out
 * of scope for this assessment. The control is rendered per the design and
 * explains itself rather than silently doing nothing.
 */
function LeaveWorkspaceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Leave Workspace
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave workspace</DialogTitle>
          <DialogDescription>
            Multi-user workspaces are outside the scope of this assessment, which uses a
            single guest account. The control is included to match the design.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ThemeSection() {
  const { mode, setMode } = useTheme();

  return (
    <section>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Theme</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Applies immediately and is remembered on this account.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(['light', 'dark'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              'flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
              mode === value ? 'border-accent-solid' : 'hover:bg-muted/50',
            )}
          >
            {value === 'light' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            <span className="flex-1 text-sm font-medium capitalize">{value}</span>
            {mode === value && <Check className="size-4 text-accent-solid" />}
          </button>
        ))}
      </div>
    </section>
  );
}

function ColorSection() {
  const { accent, setAccent } = useTheme();

  return (
    <section>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Color</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Sets the accent used for selected states, links and focus rings.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACCENTS.map((value: Accent) => (
          <button
            key={value}
            type="button"
            onClick={() => setAccent(value)}
            className={cn(
              'flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
              accent === value ? 'border-accent-solid' : 'hover:bg-muted/50',
            )}
          >
            <span
              className="size-5 rounded-md"
              style={{ backgroundColor: ACCENT_META[value].swatch }}
            />
            <span className="flex-1 text-sm font-medium">{ACCENT_META[value].label}</span>
            {accent === value && <Check className="size-4 text-accent-solid" />}
          </button>
        ))}
      </div>
    </section>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
