'use client';

import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Sun, Moon, Palette, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/components/theme-provider';
import { useLogout } from '@/lib/queries';
import { ACCENTS, ACCENT_META } from '@/lib/theme';

interface UserMenuProps {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
}

/**
 * The user dropdown from the design: identity, Change Theme, Color Mode,
 * Settings. Both theme controls live here and in Settings; they share the same
 * context so the two stay in sync.
 *
 * Log out is not in the design, but the session has to be endable from
 * somewhere and this is where the account lives.
 */
export function UserMenu({ name, email, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mode, accent, setMode, setAccent } = useTheme();
  const { mutate: logout, isPending: loggingOut } = useLogout();
  const initials = name.slice(0, 2).toUpperCase();

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        router.push('/login');
        router.refresh();
      },
      onError: (e) => toast((e as Error).message, 'error'),
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-sidebar-accent">
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-solid text-xs font-medium text-accent-foreground">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="flex-1 truncate font-medium">{name}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="flex flex-col items-center gap-1 py-3 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent-solid text-sm font-medium text-accent-foreground">
            {initials}
          </span>
          <span className="text-sm font-medium text-popover-foreground">{name}</span>
          {email && <span className="text-xs font-normal">{email}</span>}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="size-4" />
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuCheckItem checked={mode === 'light'} onSelect={() => setMode('light')}>
              <Sun className="size-4" />
              Light
            </DropdownMenuCheckItem>
            <DropdownMenuCheckItem checked={mode === 'dark'} onSelect={() => setMode('dark')}>
              <Moon className="size-4" />
              Dark
            </DropdownMenuCheckItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span
              className="size-4 rounded-sm"
              style={{ backgroundColor: ACCENT_META[accent].swatch }}
            />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Color Mode</DropdownMenuLabel>
            {ACCENTS.map((value) => (
              <DropdownMenuCheckItem
                key={value}
                checked={accent === value}
                onSelect={() => setAccent(value)}
              >
                <span
                  className="size-4 rounded-sm"
                  style={{ backgroundColor: ACCENT_META[value].swatch }}
                />
                {ACCENT_META[value].label}
              </DropdownMenuCheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild>
          <a href="/settings">
            <Settings className="size-4" />
            Settings
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            // Keep the menu mounted until the request resolves, so a failure
            // has somewhere to report itself.
            e.preventDefault();
            handleLogout();
          }}
          disabled={loggingOut}
        >
          <LogOut className="size-4" />
          {loggingOut ? 'Logging out…' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { Palette };
