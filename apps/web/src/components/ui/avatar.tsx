'use client';

import { cn } from '@/lib/utils';
import { initials as toInitials } from '@/lib/format';
import type { UserSummary } from '@/lib/types';

interface AvatarProps {
  user?: Pick<UserSummary, 'fullName' | 'username' | 'avatarUrl'> | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

export function Avatar({ user, size = 'sm', className }: AvatarProps) {
  const name = user?.fullName ?? user?.username ?? null;

  return (
    <span
      title={name ?? undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-accent-solid font-medium text-accent-foreground select-none',
        SIZES[size],
        className,
      )}
    >
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt={name ?? ''} className="size-full object-cover" />
      ) : (
        toInitials(name)
      )}
    </span>
  );
}

/**
 * Overlapping avatars with a "+n" overflow, matching the Members column.
 * Renders a dashed add button when there is nobody assigned.
 */
export function AvatarGroup({
  users,
  max = 3,
  onAdd,
}: {
  users: UserSummary[];
  max?: number;
  onAdd?: () => void;
}) {
  if (users.length === 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add member"
        className="flex size-6 items-center justify-center rounded-full border border-dashed text-muted-foreground transition-colors hover:border-solid hover:text-foreground"
      >
        <span aria-hidden="true" className="text-sm leading-none">+</span>
      </button>
    );
  }

  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((user) => (
        <Avatar key={user.id} user={user} className="ring-2 ring-background" />
      ))}
      {overflow > 0 && (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </div>
  );
}
