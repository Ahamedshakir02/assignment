'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/layout/page-header';
import { TaskListView } from '@/components/task/task-list-view';
import { TaskBoardView } from '@/components/task/task-board-view';
import { FieldsDropdown } from '@/components/task/fields-dropdown';
import { FilterDropdown } from '@/components/task/filter-dropdown';
import { SearchInput } from '@/components/task/search-input';
import {
  useTaskGroups, useCreateTask, useUpdateTask, useDeleteTask,
} from '@/lib/queries';
import { usePreferences, useDebounced } from '@/lib/use-preferences';
import type { TaskPatch, TaskFilters, TaskStatus } from '@/lib/types';

export default function TasksPage() {
  const { view, fields, setView, setFields } = usePreferences();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({});
  const debouncedSearch = useDebounced(search);

  const query = { ...filters, search: debouncedSearch || undefined };
  const { data: groups, isLoading, isError, error } = useTaskGroups(query);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  function handleAdd(title: string, status: TaskStatus) {
    createTask.mutate(
      { title, status },
      {
        onError: (e) => toast((e as Error).message, 'error'),
      },
    );
  }

  function handleUpdate(id: string, patch: TaskPatch) {
    updateTask.mutate({ id, ...patch }, { onError: (e) => toast((e as Error).message, 'error') });
  }

  function handleDelete(id: string) {
    deleteTask.mutate(id, {
      onSuccess: () => toast('Task deleted'),
      onError: (e) => toast((e as Error).message, 'error'),
    });
  }

  return (
    <>
      <PageHeader title="Tasks">
        <SearchInput value={search} onChange={setSearch} />
        <FieldsDropdown
          view={view}
          onViewChange={setView}
          fields={fields}
          onFieldsChange={setFields}
        />
        <FilterDropdown filters={filters} onChange={setFilters} />
        <Button size="sm" className="h-9" onClick={() => handleAdd('New task', 'TODO')}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </PageHeader>

      <div className="flex-1 px-4 pb-8 md:px-6">
        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">Could not load tasks</p>
            <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        ) : view === 'BOARD' ? (
          <TaskBoardView
            groups={groups}
            fields={fields}
            loading={isLoading}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <TaskListView
            groups={groups}
            fields={fields}
            loading={isLoading}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
}
