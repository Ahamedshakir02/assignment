import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

// Everything the UI renders for a task row or card, in one shape.
const TASK_INCLUDE = {
  assignees: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
  labels: true,
  reporter: { select: { id: true, fullName: true, avatarUrl: true } },
  project: { select: { id: true, name: true } },
  _count: { select: { subtasks: true, comments: true } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(ownerId: string, query: QueryTasksDto) {
    const { status, priority, search, projectId, topLevelOnly, page = 1, limit = 50 } = query;

    // ownerId is applied on every query. Two guests must never see each
    // other's data, and scoping at the service layer means no controller can
    // forget to do it.
    const where: Prisma.TaskWhereInput = {
      ownerId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(projectId && { projectId }),
      ...(topLevelOnly !== false && { parentTaskId: null }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /** List view groups by status; this returns the data pre-grouped. */
  async findGrouped(ownerId: string, query: QueryTasksDto) {
    const { items } = await this.findAll(ownerId, { ...query, limit: 200 });

    const groups: Record<TaskStatus, typeof items> = {
      BACKLOG: [], TODO: [], DOING: [], COMPLETED: [], ON_HOLD: [],
    };
    for (const task of items) groups[task.status].push(task);

    return groups;
  }

  async findOne(ownerId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, ownerId },
      include: {
        ...TASK_INCLUDE,
        subtasks: { include: TASK_INCLUDE, orderBy: { order: 'asc' } },
        resources: true,
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, fullName: true, avatarUrl: true } },
            replies: {
              include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: { actor: { select: { id: true, fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(ownerId: string, dto: CreateTaskDto) {
    const { labelIds, assigneeIds, ...rest } = dto;

    // New tasks go to the top of their column, matching the design's
    // "+ Add Task" row behaviour.
    const order = rest.order ?? (await this.nextOrder(ownerId, rest.status ?? 'TODO'));

    return this.prisma.task.create({
      data: {
        ...rest,
        order,
        ownerId,
        reporterId: ownerId,
        ...(labelIds?.length && { labels: { connect: labelIds.map((id) => ({ id })) } }),
        ...(assigneeIds?.length && { assignees: { connect: assigneeIds.map((id) => ({ id })) } }),
      },
      include: TASK_INCLUDE,
    });
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException(`Task ${id} not found`);

    const { labelIds, assigneeIds, ...rest } = dto;

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(labelIds && { labels: { set: labelIds.map((lid) => ({ id: lid })) } }),
        ...(assigneeIds && { assignees: { set: assigneeIds.map((aid) => ({ id: aid })) } }),
      },
      include: TASK_INCLUDE,
    });

    await this.recordChanges(ownerId, id, existing, dto);
    return task;
  }

  async remove(ownerId: string, id: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, ownerId } });
    if (!existing) throw new NotFoundException(`Task ${id} not found`);

    await this.prisma.task.delete({ where: { id } });
    return { id };
  }

  /** Bulk reorder — one round trip for a drag-and-drop gesture. */
  async reorder(ownerId: string, dto: ReorderTasksDto) {
    const ids = dto.items.map((i) => i.id);
    const owned = await this.prisma.task.count({ where: { id: { in: ids }, ownerId } });
    if (owned !== ids.length) throw new NotFoundException('One or more tasks not found');

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.task.update({
          where: { id: item.id },
          data: { status: item.status, order: item.order },
        }),
      ),
    );

    return { updated: ids.length };
  }

  private async nextOrder(ownerId: string, status: TaskStatus) {
    const min = await this.prisma.task.aggregate({
      where: { ownerId, status },
      _min: { order: true },
    });
    return (min._min.order ?? 0) - 1;
  }

  /** Feeds the "Updates" panel on the task detail page. */
  private async recordChanges(
    actorId: string,
    taskId: string,
    before: { status: TaskStatus; priority: string },
    dto: UpdateTaskDto,
  ) {
    const entries: { type: string; from: string; to: string }[] = [];

    if (dto.status && dto.status !== before.status) {
      entries.push({ type: 'status_changed', from: before.status, to: dto.status });
    }
    if (dto.priority && dto.priority !== before.priority) {
      entries.push({ type: 'priority_changed', from: before.priority, to: dto.priority });
    }
    if (!entries.length) return;

    await this.prisma.activity.createMany({
      data: entries.map((e) => ({ ...e, taskId, actorId })),
    });
  }
}
