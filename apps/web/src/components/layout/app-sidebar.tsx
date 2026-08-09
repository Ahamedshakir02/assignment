'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListTodo, FolderKanban, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';
import { useSidebar } from './sidebar-context';
import { useMe } from '@/lib/queries';

const NAV = [
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, isMobile, close } = useSidebar();
  const { data: me } = useMe();

  return (
    <>
      {/* Scrim — mobile only, since the sidebar overlays content there. */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground',
          isMobile
            ? // Off-canvas drawer on mobile.
              'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200'
            : 'sticky top-0 h-svh transition-[width] duration-200',
          isMobile && !open && '-translate-x-full',
          !isMobile && (open ? 'w-64' : 'w-0 overflow-hidden border-r-0'),
        )}
        aria-hidden={!open}
      >
        <div className="p-2">
          <UserMenu
            name={me?.fullName ?? 'Guest'}
            email={me?.email}
            avatarUrl={me?.avatarUrl}
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-1">
          <p className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Workspace
            <ChevronDown className="size-3" />
          </p>

          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => isMobile && close()}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
