import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.label.findMany({ where: { ownerId }, orderBy: { name: 'asc' } });
  }

  async create(ownerId: string, dto: CreateLabelDto) {
    try {
      return await this.prisma.label.create({ data: { ...dto, ownerId } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`A label named "${dto.name}" already exists`);
      }
      throw e;
    }
  }

  async remove(ownerId: string, id: string) {
    const label = await this.prisma.label.findFirst({ where: { id, ownerId } });
    if (!label) throw new NotFoundException('Label not found');

    await this.prisma.label.delete({ where: { id } });
    return { id };
  }
}
