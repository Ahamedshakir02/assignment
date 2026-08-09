import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const AUTHOR = { select: { id: true, fullName: true, username: true, avatarUrl: true } };

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, taskId: string) {
    await this.assertTaskAccess(userId, taskId);

    return this.prisma.comment.findMany({
      where: { taskId, parentId: null },
      include: {
        author: AUTHOR,
        replies: { include: { author: AUTHOR }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, taskId: string, dto: CreateCommentDto) {
    await this.assertTaskAccess(userId, taskId);

    const comment = await this.prisma.comment.create({
      data: { ...dto, taskId, authorId: userId },
      include: { author: AUTHOR, replies: { include: { author: AUTHOR } } },
    });

    // Top-level comments show up in the task's Updates feed as "posted an update".
    if (!dto.parentId) {
      await this.prisma.activity.create({
        data: { type: 'update_posted', taskId, actorId: userId },
      });
    }

    return comment;
  }

  async remove(userId: string, id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { id };
  }

  /** Comments inherit their permissions from the task they belong to. */
  private async assertTaskAccess(ownerId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, ownerId },
      select: { id: true },
    });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
  }
}
