'use client';

import { MoreHorizontal, Trash2, ArrowRight, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckItem,
} from '@/components/ui/dropdown-menu';
import { StatusDot } from './status-menu';
import { BOARD_COLUMNS, STATUS_LABEL, type Task, type TaskStatus } from '@/lib/types';

interface TaskActionsMenuProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}

/**
 * The "..." menu on every row and card. "Move to" is here as well as via drag
 * and drop, so the action stays available on touch and to keyboard users.
 */
export function TaskActionsMenu({ task, onStatusChange, onDelete }: TaskActionsMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${task.title}`}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => router.push(`/tasks/${task.id}`)}>
          <ExternalLink className="size-4" />
          Open task
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRight className="size-4" />
            Move to
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {BOARD_COLUMNS.map((status) => (
              <DropdownMenuCheckItem
                key={status}
                checked={status === task.status}
                onSelect={() => onStatusChange(status)}
              >
                <StatusDot status={status} />
                {STATUS_LABEL[status]}
              </DropdownMenuCheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={onDelete}
          className="text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
