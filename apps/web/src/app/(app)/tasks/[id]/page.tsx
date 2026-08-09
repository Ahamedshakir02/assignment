'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Lock, Eye, Share2, PanelRight, Link2, Plus, PanelLeft,
} from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { AvatarGroup, Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { PriorityMenu } from '@/components/task/priority-menu';
import { PriorityLabel } from '@/components/task/priority-indicator';
import { DueDate } from '@/components/task/due-date';
import { TaskActionsMenu } from '@/components/task/task-actions-menu';
import { AddTaskRow } from '@/components/task/add-task-row';
import { TaskDetailsRail } from '@/components/task/task-details-rail';
import { TaskComments } from '@/components/task/task-comments';
import { LabelChips } from '@/components/task/label-chips';
import { useSidebar } from '@/components/layout/sidebar-context';
import {
  useTask, useUpdateTask, useDeleteTask, useCreateTask,
  useCreateComment, useDeleteComment, useMe,
} from '@/lib/queries';
import type { Priority } from '@/lib/types';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next 15 delivers route params as a promise; `use` unwraps it.
  const { id } = use(params);

  const router = useRouter();
  const { toast } = useToast();
  const { toggle: toggleSidebar } = useSidebar();

  const { data: task, isLoading, isError, error } = useTask(id);
  const { data: me } = useMe();

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const createComment = useCreateComment(id);
  const deleteComment = useDeleteComment(id);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !task) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">Task not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error)?.message ?? 'It may have been deleted.'}
          </p>
          <Link href="/tasks" className="mt-3 inline-block text-sm underline underline-offset-4">
            Back to tasks
          </Link>
        </div>
      </div>
    );
  }

  function update(patch: Record<string, unknown>) {
    updateTask.mutate(
      { id, ...patch },
      { onError: (e) => toast((e as Error).message, 'error') },
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center gap-1 border-b bg-background/95 px-4 text-sm backdrop-blur md:px-6">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="-ml-1 mr-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
        <Link href="/tasks" className="text-muted-foreground transition-colors hover:text-foreground">
          Tasks
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="truncate font-medium">{task.title}</span>

        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <Lock className="size-4" />
          <span className="inline-flex items-center gap-1 rounded-md border px-1.5 text-xs">
            <Eye className="size-3" />1
          </span>
          <Share2 className="size-4" />
          <TaskActionsMenu
            task={task}
            onStatusChange={(status) => update({ status })}
            onDelete={() =>
              deleteTask.mutate(id, {
                onSuccess: () => {
                  toast('Task deleted');
                  router.push('/tasks');
                },
              })
            }
          />
          <PanelRight className="size-4" />
        </div>
      </header>

      <div className="grid flex-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div>
            <input
              defaultValue={task.title}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value && value !== task.title) update({ title: value });
              }}
              aria-label="Task title"
              className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none"
            />
            <textarea
              defaultValue={task.description ?? ''}
              placeholder="Add a description..."
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== (task.description ?? '')) update({ description: value });
              }}
              aria-label="Task description"
              rows={2}
              className="mt-1 w-full resize-none bg-transparent text-sm text-muted-foreground outline-none"
            />
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-start gap-4">
              <dt className="w-20 shrink-0 text-muted-foreground">Properties</dt>
              <dd className="flex flex-wrap items-center gap-2">
                {task.assignees.length > 0 ? (
                  task.assignees.map((user) => (
                    <Badge key={user.id} className="gap-1.5">
                      <Avatar user={user} className="size-4" />
                      {user.fullName ?? user.username}
                    </Badge>
                  ))
                ) : (
                  <Badge>Unassigned</Badge>
                )}
                {task.dueDate && <DueDate value={task.dueDate} variant="chip" readOnly />}
              </dd>
            </div>

            <div className="flex items-start gap-4">
              <dt className="w-20 shrink-0 text-muted-foreground">Labels</dt>
              <dd>
                {task.labels.length > 0 ? (
                  <LabelChips labels={task.labels} />
                ) : (
                  <span className="text-muted-foreground">No labels</span>
                )}
              </dd>
            </div>

            <div className="flex items-start gap-4">
              <dt className="w-20 shrink-0 text-muted-foreground">Resources</dt>
              <dd>
                {task.resources.length > 0 ? (
                  <ul className="space-y-1">
                    {task.resources.map((resource) => (
                      <li key={resource.id}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 underline underline-offset-4"
                        >
                          <Link2 className="size-3.5" />
                          {resource.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Plus className="size-3.5" />
                    Add document or link...
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <section>
            <h2 className="mb-2 text-sm font-medium">Subtasks</h2>
            <div className="overflow-hidden rounded-lg border">
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-full">Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.subtasks.map((subtask) => (
                      <TableRow key={subtask.id}>
                        <TableCell className="font-medium">{subtask.title}</TableCell>
                        <TableCell>
                          <PriorityMenu
                            value={subtask.priority}
                            onChange={(priority: Priority) =>
                              updateTask.mutate({ id: subtask.id, priority })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <AvatarGroup users={subtask.assignees} />
                        </TableCell>
                        <TableCell>
                          <DueDate
                            value={subtask.dueDate}
                            onChange={(dueDate) => updateTask.mutate({ id: subtask.id, dueDate })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <TaskActionsMenu
                            task={subtask}
                            onStatusChange={(status) =>
                              updateTask.mutate({ id: subtask.id, status })
                            }
                            onDelete={() => deleteTask.mutate(subtask.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <ul className="divide-y sm:hidden">
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-2 p-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {subtask.title}
                    </span>
                    <PriorityLabel priority={subtask.priority} />
                  </li>
                ))}
              </ul>

              <div className="border-t">
                <AddTaskRow
                  status={task.status}
                  label="Add Subtasks"
                  onAdd={(title) =>
                    createTask.mutate({ title, parentTaskId: id, status: task.status })
                  }
                />
              </div>
            </div>
          </section>

          <TaskComments
            comments={task.comments}
            currentUserId={me?.id}
            pending={createComment.isPending}
            onAdd={(body, parentId) =>
              createComment.mutate(
                { body, parentId },
                { onError: (e) => toast((e as Error).message, 'error') },
              )
            }
            onDelete={(commentId) => deleteComment.mutate(commentId)}
          />
        </div>

        <aside className="lg:sticky lg:top-16 lg:self-start">
          <TaskDetailsRail task={task} onUpdate={update} />
        </aside>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
