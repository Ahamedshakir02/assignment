import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const PROJECT_INCLUDE = {
  lead: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
  _count: { select: { tasks: true } },
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string, search?: string) {
    return this.prisma.project.findMany({
      where: {
        ownerId,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      include: PROJECT_INCLUDE,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(ownerId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  create(ownerId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, ownerId },
      include: PROJECT_INCLUDE,
    });
  }

  async update(ownerId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(ownerId, id);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: PROJECT_INCLUDE,
    });
  }

  async remove(ownerId: string, id: string) {
    await this.findOne(ownerId, id);
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }
}
