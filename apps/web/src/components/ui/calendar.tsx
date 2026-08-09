'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMonthYear, isSameDay } from '@/lib/format';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarProps {
  selected?: Date | null;
  onSelect: (date: Date) => void;
}

/**
 * Month grid matching the date picker in the design: leading and trailing days
 * from adjacent months are shown greyed out, today is outlined, the selection
 * is filled.
 *
 * Hand-rolled rather than adding react-day-picker — this is the only calendar
 * in the app and it is ~60 lines.
 */
export function Calendar({ selected, onSelect }: CalendarProps) {
  const initial = selected ?? new Date();
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Start the grid on the Sunday on or before the 1st.
  const gridStart = new Date(year, month, 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  // Six rows always, so the popover never changes height between months.
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const today = new Date();

  return (
    <div className="w-64 select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">{formatMonthYear(year, month)}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-normal text-muted-foreground">
            {day}
          </div>
        ))}

        {days.map((date) => {
          const outside = date.getMonth() !== month;
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelect(date)}
              aria-current={isToday ? 'date' : undefined}
              className={cn(
                'flex size-8 items-center justify-center rounded-md text-sm transition-colors',
                outside && 'text-muted-foreground/50',
                !isSelected && 'hover:bg-muted',
                isToday && !isSelected && 'ring-1 ring-border',
                isSelected && 'bg-primary font-medium text-primary-foreground',
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
