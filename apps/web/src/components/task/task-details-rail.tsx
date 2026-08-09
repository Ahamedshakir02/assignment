'use client';

import { CalendarDays, Plus, Settings2, Tag, Users } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { PriorityMenu } from './priority-menu';
import { StatusMenu } from './status-menu';
import { LabelChips } from './label-chips';
import { formatDate, formatRelative, toISODate } from '@/lib/format';
import { PRIORITY_LABEL, STATUS_LABEL, type TaskDetail } from '@/lib/types';

interface TaskDetailsRailProps {
  task: TaskDetail;
  onUpdate: (patch: Record<string, unknown>) => void;
}

/** Right-hand Details panel and Updates feed from the task detail screen. */
export function TaskDetailsRail({ task, onUpdate }: TaskDetailsRailProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-card">
        <header className="flex items-center gap-2 px-3 py-2">
          <h2 className="flex-1 text-sm font-medium">Details</h2>
          <Plus className="size-4 text-muted-foreground" />
          <Settings2 className="size-4 text-muted-foreground" />
        </header>

        <Separator />

        <dl className="space-y-1 p-3 text-sm">
          <Row label="Status">
            <StatusMenu value={task.status} onChange={(status) => onUpdate({ status })} />
          </Row>

          <Row label="Priority">
            <PriorityMenu
              value={task.priority}
              onChange={(priority) => onUpdate({ priority })}
            />
          </Row>

          <Row label="Members">
            {task.assignees.length > 0 ? (
              <div className="flex items-center -space-x-1.5">
                {task.assignees.map((user) => (
                  <Avatar key={user.id} user={user} className="ring-2 ring-card" />
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-4" />
                Add members
              </span>
            )}
          </Row>

          <Row label="Dates">
            <div className="flex items-center gap-1">
              <DateChip
                value={task.startDate}
                placeholder="Start"
                onChange={(startDate) => onUpdate({ startDate })}
              />
              <span className="text-muted-foreground">&rarr;</span>
              <DateChip
                value={task.dueDate}
                placeholder="End"
                onChange={(dueDate) => onUpdate({ dueDate })}
              />
            </div>
          </Row>

          <Row label="Labels">
            {task.labels.length > 0 ? (
              <LabelChips labels={task.labels} max={3} />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Tag className="size-4" />
                Add labels
              </span>
            )}
          </Row>

          <Row label="Reporter">
            {task.reporter ? (
              <span className="inline-flex items-center gap-1.5">
                <Avatar user={task.reporter} />
                {task.reporter.fullName ?? task.reporter.username}
              </span>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </Row>
        </dl>
      </section>

      <section className="rounded-lg border bg-card">
        <header className="px-3 py-2">
          <h2 className="text-sm font-medium">Updates</h2>
        </header>
        <Separator />

        <ul className="space-y-3 p-3">
          {task.activities.length === 0 && (
            <li className="text-sm text-muted-foreground">No activity yet.</li>
          )}

          {task.activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-2 text-sm">
              <Avatar user={activity.actor} />
              <p className="flex-1 leading-snug text-muted-foreground">
                <span className="font-medium text-card-foreground">
                  {activity.actor.fullName ?? 'You'}
                </span>{' '}
                {describeActivity(activity.type, activity.from, activity.to)}
                <span className="block text-xs">{formatRelative(activity.createdAt)}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-2 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function DateChip({
  value, placeholder, onChange,
}: {
  value: string | null;
  placeholder: string;
  onChange: (date: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors hover:bg-muted">
        <CalendarDays className="size-3" />
        {value ? formatDate(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          selected={value ? new Date(value) : null}
          onSelect={(date) => onChange(toISODate(date))}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Turns an activity record into the sentence shown in the Updates feed. */
function describeActivity(type: string, from: string | null, to: string | null): string {
  switch (type) {
    case 'priority_changed':
      return `changed priority from ${label(from, PRIORITY_LABEL)} to ${label(to, PRIORITY_LABEL)}`;
    case 'status_changed':
      return `moved this from ${label(from, STATUS_LABEL)} to ${label(to, STATUS_LABEL)}`;
    case 'update_posted':
      return 'posted an update';
    default:
      return 'updated this task';
  }
}

function label(value: string | null, map: Record<string, string>): string {
  if (!value) return 'none';
  return map[value] ?? value.toLowerCase();
}
