'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { api } from './api';
import type {
  Task, TaskDetail, TaskGroups, TaskFilters, Project, Label, Comment, CurrentUser,
  TaskStatus, Priority, TaskPatch, ProjectPatch,
} from './types';

export const queryKeys = {
  me: ['me'] as const,
  tasks: (filters: TaskFilters) => ['tasks', filters] as const,
  task: (id: string) => ['task', id] as const,
  projects: (search?: string) => ['projects', search ?? ''] as const,
  labels: ['labels'] as const,
};

function toSearchParams(filters: TaskFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api.get<CurrentUser>('/users/me'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaskGroups(filters: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks(filters),
    queryFn: () => api.get<TaskGroups>(`/tasks/grouped${toSearchParams(filters)}`),
    // Keeps the previous results on screen while a new search runs, so the
    // table does not flash empty on every keystroke.
    placeholderData: keepPreviousData,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.task(id),
    queryFn: () => api.get<TaskDetail>(`/tasks/${id}`),
    enabled: Boolean(id),
  });
}

export function useProjects(search?: string) {
  return useQuery({
    queryKey: queryKeys.projects(search),
    queryFn: () => api.get<Project[]>(`/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    placeholderData: keepPreviousData,
  });
}

export function useLabels() {
  return useQuery({
    queryKey: queryKeys.labels,
    queryFn: () => api.get<Label[]>('/labels'),
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Task mutations
// ---------------------------------------------------------------------------

export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  projectId?: string;
  parentTaskId?: string;
}

export type UpdateTaskInput = TaskPatch & { id: string };
export type UpdateProjectInput = ProjectPatch & { id: string };

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => api.post<Task>('/tasks', input),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      if (task.parentTaskId) {
        qc.invalidateQueries({ queryKey: queryKeys.task(task.parentTaskId) });
      }
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateTaskInput) => api.patch<Task>(`/tasks/${id}`, patch),

    // Optimistic: apply the change to every cached task list immediately so
    // status and priority edits feel instant.
    onMutate: async ({ id, ...patch }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const snapshot = qc.getQueriesData<TaskGroups>({ queryKey: ['tasks'] });

      qc.setQueriesData<TaskGroups>({ queryKey: ['tasks'] }, (groups) => {
        if (!groups) return groups;

        const next: TaskGroups = { BACKLOG: [], TODO: [], DOING: [], COMPLETED: [], ON_HOLD: [] };
        const all = Object.values(groups).flat();

        for (const task of all) {
          const updated = task.id === id ? { ...task, ...patch } as Task : task;
          next[updated.status].push(updated);
        }
        return next;
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      // Roll the cache back to exactly what it was before the optimistic write.
      context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: (_data, _err, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: queryKeys.task(variables.id) });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/tasks/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const snapshot = qc.getQueriesData<TaskGroups>({ queryKey: ['tasks'] });

      qc.setQueriesData<TaskGroups>({ queryKey: ['tasks'] }, (groups) => {
        if (!groups) return groups;
        const next = { ...groups };
        for (const status of Object.keys(next) as TaskStatus[]) {
          next[status] = next[status].filter((t) => t.id !== id);
        }
        return next;
      });

      return { snapshot };
    },
    onError: (_e, _v, context) => {
      context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export interface ReorderItem {
  id: string;
  status: TaskStatus;
  order: number;
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderItem[]) => api.patch<{ updated: number }>('/tasks/reorder', { items }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; priority?: string; dueDate?: string }) =>
      api.post<Project>('/projects', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateProjectInput) => api.patch<Project>(`/projects/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; parentId?: string }) =>
      api.post<Comment>(`/tasks/${taskId}/comments`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/comments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
  });
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.patch('/users/me/preferences', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.patch('/users/me', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * The API clears the httpOnly cookie; the cache is dropped so the next account
 * to sign in on this browser never sees the previous one's tasks.
 */
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => qc.clear(),
  });
}
