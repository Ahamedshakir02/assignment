'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { AvatarGroup } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PriorityMenu } from './priority-menu';
import { PriorityLabel } from './priority-indicator';
import { DueDate } from './due-date';
import { LabelChips } from './label-chips';
import { StatusDot } from './status-menu';
import { TaskActionsMenu } from './task-actions-menu';
import { AddTaskRow } from './add-task-row';
import {
  LIST_GROUPS, STATUS_LABEL,
  type FieldVisibility, type Task, type TaskGroups, type TaskStatus, type Priority, type TaskPatch,
} from '@/lib/types';

interface TaskListViewProps {
  groups?: TaskGroups;
  fields: FieldVisibility;
  loading?: boolean;
  onAdd: (title: string, status: TaskStatus) => void;
  onUpdate: (id: string, patch: TaskPatch) => void;
  onDelete: (id: string) => void;
}

export function TaskListView({
  groups, fields, loading, onAdd, onUpdate, onDelete,
}: TaskListViewProps) {
  if (loading && !groups) return <ListSkeleton />;

  const total = groups ? LIST_GROUPS.reduce((n, s) => n + (groups[s]?.length ?? 0), 0) : 0;

  if (groups && total === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Add your first task using the button in any section below, or the Add Task button above."
      />
    );
  }

  return (
    <div className="space-y-6">
      {LIST_GROUPS.map((status) => (
        <TaskGroup
          key={status}
          status={status}
          tasks={groups?.[status] ?? []}
          fields={fields}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function TaskGroup({
  status, tasks, fields, onAdd, onUpdate, onDelete,
}: {
  status: TaskStatus;
  tasks: Task[];
  fields: FieldVisibility;
} & Pick<TaskListViewProps, 'onAdd' | 'onUpdate' | 'onDelete'>) {
  const router = useRouter();

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group mb-2 flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground">
        <ChevronDown className="size-4 transition-transform group-data-[state=closed]:-rotate-90" />
        {STATUS_LABEL[status]}
        <span className="text-muted-foreground">{tasks.length}</span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="overflow-hidden rounded-lg border">
          {/* Table on tablet and up; stacked cards on phones, where six
              columns cannot fit without unusable horizontal scrolling. */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-full">Task</TableHead>
                  {fields.priority && <TableHead>Priority</TableHead>}
                  {fields.status && <TableHead>Status</TableHead>}
                  {fields.members && <TableHead>Members</TableHead>}
                  {fields.labels && <TableHead>Labels</TableHead>}
                  {fields.dueDate && <TableHead>Due Date</TableHead>}
                  {fields.reporter && <TableHead>Reporter</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>

                    {fields.priority && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <PriorityMenu
                          value={task.priority}
                          onChange={(priority: Priority) => onUpdate(task.id, { priority })}
                        />
                      </TableCell>
                    )}

                    {fields.status && (
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <StatusDot status={task.status} />
                          {STATUS_LABEL[task.status]}
                        </span>
                      </TableCell>
                    )}

                    {fields.members && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <AvatarGroup users={task.assignees} />
                      </TableCell>
                    )}

                    {fields.labels && (
                      <TableCell>
                        <LabelChips labels={task.labels} max={2} />
                      </TableCell>
                    )}

                    {fields.dueDate && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DueDate
                          value={task.dueDate}
                          onChange={(dueDate) => onUpdate(task.id, { dueDate })}
                        />
                      </TableCell>
                    )}

                    {fields.reporter && (
                      <TableCell>
                        <AvatarGroup users={task.reporter ? [task.reporter] : []} />
                      </TableCell>
                    )}

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <TaskActionsMenu
                        task={task}
                        onStatusChange={(next) => onUpdate(task.id, { status: next })}
                        onDelete={() => onDelete(task.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="divide-y md:hidden">
            {tasks.map((task) => (
              <MobileTaskRow
                key={task.id}
                task={task}
                fields={fields}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="border-t">
            <AddTaskRow status={status} onAdd={onAdd} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MobileTaskRow({
  task, fields, onUpdate, onDelete,
}: {
  task: Task;
  fields: FieldVisibility;
} & Pick<TaskListViewProps, 'onUpdate' | 'onDelete'>) {
  const router = useRouter();

  return (
    <div className="flex items-start gap-2 p-3">
      <button
        type="button"
        onClick={() => router.push(`/tasks/${task.id}`)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-medium">{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {fields.priority && <PriorityLabel priority={task.priority} />}
          {fields.dueDate && task.dueDate && <DueDate value={task.dueDate} readOnly />}
        </div>
      </button>

      {fields.members && <AvatarGroup users={task.assignees} max={2} />}

      <TaskActionsMenu
        task={task}
        onStatusChange={(next) => onUpdate(task.id, { status: next })}
        onDelete={() => onDelete(task.id)}
      />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((group) => (
        <div key={group}>
          <Skeleton className="mb-2 h-5 w-24" />
          <div className="space-y-px overflow-hidden rounded-lg border">
            <Skeleton className="h-10 w-full rounded-none" />
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-none" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
