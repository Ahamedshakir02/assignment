'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { PriorityIcon } from './priority-indicator';
import { PRIORITIES, PRIORITY_LABEL, type Priority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriorityMenuProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function PriorityMenu({ value, onChange, className, align = 'start' }: PriorityMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Priority: ${PRIORITY_LABEL[value]}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted',
          className,
        )}
      >
        <PriorityIcon priority={value} />
        <span className={value === 'NONE' ? 'text-muted-foreground' : undefined}>
          {PRIORITY_LABEL[value]}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-44">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {PRIORITIES.map((priority) => (
          <DropdownMenuCheckItem
            key={priority}
            checked={priority === value}
            onSelect={() => onChange(priority)}
          >
            <PriorityIcon priority={priority} />
            {PRIORITY_LABEL[priority]}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
