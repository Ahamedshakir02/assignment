'use client';

import { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PriorityMenu } from '@/components/task/priority-menu';
import { PriorityLabel } from '@/components/task/priority-indicator';
import { DueDate } from '@/components/task/due-date';
import { SearchInput } from '@/components/task/search-input';
import { AddTaskRow } from '@/components/task/add-task-row';
import {
  useProjects, useCreateProject, useUpdateProject, useDeleteProject,
} from '@/lib/queries';
import { useDebounced } from '@/lib/use-preferences';
import type { Priority } from '@/lib/types';

export default function ProjectsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);

  const { data: projects, isLoading } = useProjects(debouncedSearch || undefined);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  function handleAdd(name: string) {
    createProject.mutate({ name }, { onError: (e) => toast((e as Error).message, 'error') });
  }

  return (
    <>
      <PageHeader title="Projects">
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects" />
        <Button size="sm" className="h-9" onClick={() => handleAdd('New project')}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Project</span>
        </Button>
      </PageHeader>

      <div className="flex-1 px-4 pb-8 md:px-6">
        {isLoading && !projects ? (
          <div className="space-y-px overflow-hidden rounded-lg border">
            <Skeleton className="h-10 w-full rounded-none" />
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-none" />
            ))}
          </div>
        ) : projects && projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-8" />}
            title={search ? 'No projects match your search' : 'No projects yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Projects group related tasks together. Create your first one to get started.'
            }
            action={
              !search && (
                <Button size="sm" onClick={() => handleAdd('New project')}>
                  <Plus className="size-4" />
                  Add Project
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-full">Projects</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {projects?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <span className="font-medium">{project.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {project._count.tasks} task{project._count.tasks === 1 ? '' : 's'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <PriorityMenu
                          value={project.priority}
                          onChange={(priority: Priority) =>
                            updateProject.mutate({ id: project.id, priority })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <AvatarGroup users={project.lead ? [project.lead] : []} />
                      </TableCell>
                      <TableCell>
                        <DueDate
                          value={project.dueDate}
                          onChange={(dueDate) =>
                            updateProject.mutate({ id: project.id, dueDate })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${project.name}`}
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10"
                              onSelect={() =>
                                deleteProject.mutate(project.id, {
                                  onSuccess: () => toast('Project deleted'),
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                              Delete project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul className="divide-y md:hidden">
              {projects?.map((project) => (
                <li key={project.id} className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project._count.tasks} tasks
                    </p>
                  </div>
                  <PriorityLabel priority={project.priority} />
                </li>
              ))}
            </ul>

            <div className="border-t">
              <AddTaskRow status="TODO" label="Add Projects" onAdd={(name) => handleAdd(name)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
