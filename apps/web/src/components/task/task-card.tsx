'use client';

import { useRouter } from 'next/navigation';
import { GripVertical } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DueDate } from './due-date';
import { LabelChips } from './label-chips';
import { PriorityIcon } from './priority-indicator';
import { TaskActionsMenu } from './task-actions-menu';
import { cn } from '@/lib/utils';
import type { FieldVisibility, Task, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  fields: FieldVisibility;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging: boolean;
}

export function TaskCard({
  task, fields, onStatusChange, onDelete, onDragStart, onDragEnd, dragging,
}: TaskCardProps) {
  const router = useRouter();

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        // Firefox refuses to start a drag unless data is set.
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group rounded-lg border bg-card p-3 shadow-sm transition-opacity',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-start gap-1">
        <GripVertical
          className="mt-0.5 hidden size-4 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:block"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => router.push(`/tasks/${task.id}`)}
          className="min-w-0 flex-1 text-left text-sm font-medium leading-snug hover:underline"
        >
          {task.title}
        </button>

        <TaskActionsMenu task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 pl-0 md:pl-5">
        {fields.priority && task.priority !== 'NONE' && (
          <PriorityIcon priority={task.priority} />
        )}

        {fields.members && task.assignees[0] && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Avatar user={task.assignees[0]} />
            {task.assignees[0].fullName ?? task.assignees[0].username}
          </span>
        )}

        {fields.dueDate && task.dueDate && (
          <DueDate value={task.dueDate} variant="chip" readOnly className="ml-auto" />
        )}
      </div>

      {fields.labels && task.labels.length > 0 && (
        <div className="mt-2 pl-0 md:pl-5">
          <LabelChips labels={task.labels} max={3} />
        </div>
      )}
    </article>
  );
}
