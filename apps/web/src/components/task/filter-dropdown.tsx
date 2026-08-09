'use client';

import { SlidersHorizontal, X } from 'lucide-react';
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
import { PriorityIcon } from './priority-indicator';
import { StatusDot } from './status-menu';
import {
  TASK_STATUSES, STATUS_LABEL, PRIORITIES, PRIORITY_LABEL,
  type TaskFilters, type TaskStatus, type Priority,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function FilterDropdown({ filters, onChange }: FilterDropdownProps) {
  const activeCount = [filters.status, filters.priority].filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Filter tasks"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors hover:bg-muted',
          activeCount > 0 && 'border-accent-solid text-accent-solid',
        )}
      >
        <SlidersHorizontal className="size-4" />
        {activeCount > 0 && <span className="text-xs font-medium">{activeCount}</span>}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <StatusDot status={filters.status ?? 'TODO'} />
            Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {TASK_STATUSES.map((status: TaskStatus) => (
              <DropdownMenuCheckItem
                key={status}
                checked={filters.status === status}
                onSelect={() =>
                  onChange({ ...filters, status: filters.status === status ? undefined : status })
                }
              >
                <StatusDot status={status} />
                {STATUS_LABEL[status]}
              </DropdownMenuCheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PriorityIcon priority={filters.priority ?? 'NONE'} />
            Priority
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {PRIORITIES.map((priority: Priority) => (
              <DropdownMenuCheckItem
                key={priority}
                checked={filters.priority === priority}
                onSelect={() =>
                  onChange({
                    ...filters,
                    priority: filters.priority === priority ? undefined : priority,
                  })
                }
              >
                <PriorityIcon priority={priority} />
                {PRIORITY_LABEL[priority]}
              </DropdownMenuCheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onChange({ ...filters, status: undefined, priority: undefined })}
            >
              <X className="size-4" />
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
