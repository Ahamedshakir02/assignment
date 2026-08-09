'use client';

import { CalendarDays } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateShort, isOverdue, toISODate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface DueDateProps {
  value: string | null;
  onChange?: (date: string | null) => void;
  variant?: 'text' | 'chip';
  readOnly?: boolean;
  className?: string;
}

/**
 * Due date cell. Plain text in tables, a chip on board cards — and red in both
 * once the date has passed, matching the design.
 */
export function DueDate({ value, onChange, variant = 'text', readOnly, className }: DueDateProps) {
  const overdue = isOverdue(value);
  const label = variant === 'chip' ? formatDateShort(value) : formatDate(value);

  const display = (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap',
        variant === 'chip' && 'rounded-md border px-1.5 py-0.5 text-xs',
        variant === 'chip' && overdue && 'border-destructive/30 bg-destructive/10',
        overdue ? 'text-destructive' : 'text-muted-foreground',
        !value && 'text-muted-foreground',
        className,
      )}
    >
      {variant === 'chip' && <CalendarDays className="size-3" />}
      {label || 'No date'}
    </span>
  );

  if (readOnly || !onChange) return display;

  return (
    <Popover>
      <PopoverTrigger
        className="rounded-md px-1 py-0.5 transition-colors hover:bg-muted"
        aria-label={value ? `Due ${formatDate(value)}` : 'Set due date'}
      >
        {display}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          selected={value ? new Date(value) : null}
          onSelect={(date) => onChange(toISODate(date))}
        />
        {value && (
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => onChange(null)}>
            Clear date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
