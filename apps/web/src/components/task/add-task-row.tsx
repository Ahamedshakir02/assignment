'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/types';

interface AddTaskRowProps {
  status: TaskStatus;
  onAdd: (title: string, status: TaskStatus) => void;
  label?: string;
  className?: string;
}

/**
 * The inline "+ Add Task" affordance at the foot of every group and column.
 * Enter commits and keeps the field open for a second entry; Escape or blur on
 * an empty field closes it.
 */
export function AddTaskRow({ status, onAdd, label = 'Add Task', className }: AddTaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }
    onAdd(trimmed, status);
    setTitle('');
  }

  if (editing) {
    return (
      <div className={cn('px-4 py-2', className)}>
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setTitle('');
              setEditing(false);
            }
          }}
          onBlur={() => {
            if (title.trim()) commit();
            setEditing(false);
          }}
          placeholder="Task name, then Enter"
          aria-label="New task title"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        'flex w-full items-center gap-1.5 px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground',
        className,
      )}
    >
      <Plus className="size-4" />
      {label}
    </button>
  );
}
