'use client';

import { Columns3, List, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { FieldVisibility } from '@/lib/types';

const FIELD_ROWS: { key: keyof FieldVisibility; label: string }[] = [
  { key: 'priority', label: 'Priority' },
  { key: 'members', label: 'Members' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'labels', label: 'Labels' },
  { key: 'status', label: 'Status' },
  { key: 'reporter', label: 'Reporter' },
];

interface FieldsDropdownProps {
  view: 'LIST' | 'BOARD';
  onViewChange: (view: 'LIST' | 'BOARD') => void;
  fields: FieldVisibility;
  onFieldsChange: (fields: FieldVisibility) => void;
}

/**
 * The Fields dropdown: view switcher on top, column visibility below.
 *
 * DEVIATION: the design lists "Members" twice. Rendered once here — see README.
 */
export function FieldsDropdown({
  view, onViewChange, fields, onFieldsChange,
}: FieldsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors hover:bg-muted">
        <Columns3 className="size-4" />
        <span className="hidden sm:inline">Fields</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2">
        <Tabs
          value={view}
          onValueChange={(value) => onViewChange(value as 'LIST' | 'BOARD')}
          className="mb-2"
        >
          <TabsList className="w-full">
            <TabsTrigger value="LIST">
              <List />
              List
            </TabsTrigger>
            <TabsTrigger value="BOARD">
              <LayoutGrid />
              Board
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Separator className="my-2" />

        <div className="space-y-0.5">
          {FIELD_ROWS.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              {label}
              <Checkbox
                checked={fields[key]}
                onCheckedChange={(checked) =>
                  onFieldsChange({ ...fields, [key]: checked === true })
                }
              />
            </label>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
