'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { TASK_STATUSES, STATUS_LABEL, type TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const DOT: Record<TaskStatus, string> = {
  BACKLOG: 'bg-status-backlog',
  TODO: 'bg-muted-foreground',
  DOING: 'bg-accent-solid',
  COMPLETED: 'bg-priority-low',
  ON_HOLD: 'bg-priority-high',
};

export function StatusDot({ status }: { status: TaskStatus }) {
  return <span className={cn('size-2 shrink-0 rounded-full', DOT[status])} aria-hidden="true" />;
}

export function StatusMenu({
  value,
  onChange,
  className,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Status: ${STATUS_LABEL[value]}`}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted',
          className,
        )}
      >
        <StatusDot status={value} />
        {STATUS_LABEL[value]}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {TASK_STATUSES.map((status) => (
          <DropdownMenuCheckItem
            key={status}
            checked={status === value}
            onSelect={() => onChange(status)}
          >
            <StatusDot status={status} />
            {STATUS_LABEL[status]}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
