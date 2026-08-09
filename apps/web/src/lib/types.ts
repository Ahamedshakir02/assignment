/** Mirrors the API response shapes. Kept in one place so views never guess. */

export const TASK_STATUSES = ['BACKLOG', 'TODO', 'DOING', 'COMPLETED', 'ON_HOLD'] as const;
export const PRIORITIES = ['NONE', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

/** Board columns, in the order the design shows them. */
export const BOARD_COLUMNS: TaskStatus[] = ['TODO', 'DOING', 'COMPLETED', 'ON_HOLD'];

/**
 * List view groups. The design shows To Do / Doing / Completed; Backlog is
 * added because the status is reachable from the task detail Status menu and
 * from the Filter dropdown, and a new account is seeded with one. Without a
 * group of its own, a Backlog task rendered nowhere in either view and
 * filtering by Backlog produced an empty list.
 */
export const LIST_GROUPS: TaskStatus[] = ['BACKLOG', 'TODO', 'DOING', 'COMPLETED'];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  DOING: 'Doing',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  NONE: 'No Priority',
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export interface UserSummary {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface CurrentUser extends UserSummary {
  email: string | null;
  title: string | null;
  isGuest: boolean;
  themeMode: 'LIGHT' | 'DARK';
  accent: 'AMBER' | 'BLUE' | 'PINK' | 'ROSE' | 'EMERALD' | 'BLACK';
  viewMode: 'LIST' | 'BOARD';
  visibleFields: Record<string, boolean> | null;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  order: number;
  projectId: string | null;
  parentTaskId: string | null;
  reporterId: string | null;
  assignees: UserSummary[];
  labels: Label[];
  reporter: UserSummary | null;
  project: { id: string; name: string } | null;
  _count: { subtasks: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  body: string;
  authorId: string;
  parentId: string | null;
  author: UserSummary;
  replies?: Comment[];
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  from: string | null;
  to: string | null;
  actor: UserSummary;
  createdAt: string;
}

export interface Resource {
  id: string;
  label: string;
  url: string;
}

export interface TaskDetail extends Task {
  subtasks: Task[];
  comments: Comment[];
  activities: Activity[];
  resources: Resource[];
}

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  dueDate: string | null;
  order: number;
  lead: UserSummary | null;
  _count: { tasks: number };
}

export type TaskGroups = Record<TaskStatus, Task[]>;

/** Column visibility, driven by the Fields dropdown. */
export interface FieldVisibility {
  priority: boolean;
  members: boolean;
  dueDate: boolean;
  labels: boolean;
  status: boolean;
  reporter: boolean;
}

export const DEFAULT_FIELDS: FieldVisibility = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

/**
 * The task fields a client is allowed to write.
 *
 * The API runs `forbidNonWhitelisted`, so sending anything outside
 * UpdateTaskDto returns a 400. Typing patches with this — rather than
 * Partial<Task>, which would also permit `assignees`, `_count` and friends —
 * turns that into a compile error instead of a runtime one.
 */
export interface TaskPatch {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  order?: number;
  projectId?: string;
  labelIds?: string[];
  assigneeIds?: string[];
}

export interface ProjectPatch {
  name?: string;
  priority?: Priority;
  dueDate?: string | null;
  leadId?: string;
  order?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  projectId?: string;
}
