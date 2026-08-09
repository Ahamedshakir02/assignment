'use client';

import { cn } from '@/lib/utils';
import { PRIORITY_LABEL, type Priority } from '@/lib/types';

const COLOR: Record<Priority, string> = {
  URGENT: 'text-priority-urgent',
  HIGH: 'text-priority-high',
  MEDIUM: 'text-priority-medium',
  LOW: 'text-priority-low',
  NONE: 'text-priority-none',
};

/** How many of the three bars are filled for each level. */
const FILLED: Record<Priority, number> = {
  URGENT: 3,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NONE: 0,
};

/**
 * The stepped bar-chart glyph used beside every priority in the design.
 * NONE renders a single dot rather than empty bars.
 */
export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  const filled = FILLED[priority];

  if (priority === 'NONE') {
    return (
      <svg viewBox="0 0 16 16" className={cn('size-4', COLOR.NONE, className)} aria-hidden="true">
        <circle cx="8" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className={cn('size-4', COLOR[priority], className)} aria-hidden="true">
      {[0, 1, 2].map((i) => {
        const height = 4 + i * 3;
        return (
          <rect
            key={i}
            x={1 + i * 5}
            y={13 - height}
            width={3}
            height={height}
            rx={1}
            fill="currentColor"
            opacity={i < filled ? 1 : 0.25}
          />
        );
      })}
    </svg>
  );
}

export function PriorityLabel({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', COLOR[priority], className)}>
      <PriorityIcon priority={priority} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
