'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Collapsed to an icon until used, matching the design. Cmd/Ctrl+F opens it —
 * the design shows a ⌘F badge on the field.
 */
export function SearchInput({ value, onChange, placeholder = 'Search' }: SearchInputProps) {
  const [open, setOpen] = useState(Boolean(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setOpen(true);
        // Wait for the input to mount before focusing it.
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (e.key === 'Escape' && open) {
        onChange('');
        setOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onChange]);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Search tasks"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="inline-flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border px-3 sm:max-w-xs',
        'focus-within:ring-1 focus-within:ring-ring',
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tasks"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="hidden rounded border px-1 text-[10px] text-muted-foreground sm:inline">
          ⌘F
        </kbd>
      )}
    </div>
  );
}
