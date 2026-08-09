import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch (e) {
      // P2002 = unique constraint. Username and email are both unique, so give
      // the client something actionable instead of a 500.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const field = (e.meta?.target as string[])?.[0] ?? 'value';
        throw new ConflictException(`That ${field} is already taken`);
      }
      throw e;
    }
  }

  updatePreferences(id: string, dto: UpdatePreferencesDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto as Prisma.UserUpdateInput,
    });
  }
}
