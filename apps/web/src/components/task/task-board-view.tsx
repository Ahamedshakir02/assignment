'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from './task-card';
import { AddTaskRow } from './add-task-row';
import { cn } from '@/lib/utils';
import {
  BOARD_COLUMNS, STATUS_LABEL,
  type FieldVisibility, type TaskGroups, type TaskStatus, type TaskPatch,
} from '@/lib/types';

interface TaskBoardViewProps {
  groups?: TaskGroups;
  fields: FieldVisibility;
  loading?: boolean;
  onAdd: (title: string, status: TaskStatus) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onDelete: (id: string) => void;
}

/**
 * Kanban board. Drag and drop uses the native HTML5 API rather than a library —
 * it covers desktop with no dependency, and every move is also available from
 * the card's "..." menu, which is what touch and keyboard users get.
 */
export function TaskBoardView({
  groups, fields, loading, onAdd, onUpdate, onDelete,
}: TaskBoardViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  if (loading && !groups) return <BoardSkeleton />;

  function handleDrop(status: TaskStatus) {
    if (draggingId) onUpdate(draggingId, { status });
    setDraggingId(null);
    setOverColumn(null);
  }

  return (
    // Horizontal scroll with snap points, so columns stay usable on a phone.
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:snap-none md:px-0">
      {BOARD_COLUMNS.map((status) => {
        const tasks = groups?.[status] ?? [];

        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setOverColumn(status);
            }}
            onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
            onDrop={() => handleDrop(status)}
            className={cn(
              'flex w-[85vw] shrink-0 snap-start flex-col rounded-lg border bg-muted/30 transition-colors sm:w-72',
              overColumn === status && 'border-accent-solid bg-accent-subtle/40',
            )}
          >
            <header className="flex items-center gap-1.5 px-3 py-2.5">
              <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-sm font-medium">{STATUS_LABEL[status]}</h2>
              <span className="text-sm text-muted-foreground">{tasks.length}</span>

              <div className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label={`Add task to ${STATUS_LABEL[status]}`}
                  onClick={() => onAdd('New task', status)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="size-4" />
                </button>
                <span className="rounded-md p-1 text-muted-foreground">
                  <MoreHorizontal className="size-4" />
                </span>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  fields={fields}
                  dragging={draggingId === task.id}
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onStatusChange={(next) => onUpdate(task.id, { status: next })}
                  onDelete={() => onDelete(task.id)}
                />
              ))}

              {tasks.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  Drop a task here
                </p>
              )}

              <AddTaskRow status={status} onAdd={onAdd} className="rounded-md px-2" />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[0, 1, 2, 3].map((column) => (
        <div key={column} className="w-72 shrink-0 space-y-2 rounded-lg border bg-muted/30 p-2">
          <Skeleton className="h-6 w-24" />
          {[0, 1, 2].map((card) => (
            <Skeleton key={card} className="h-20 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
