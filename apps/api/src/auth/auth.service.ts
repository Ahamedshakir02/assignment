import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Guest login. Creates a throwaway user and seeds it with a small amount of
   * starter content so the app never opens on an empty screen.
   */
  async loginAsGuest() {
    const suffix = Math.floor(1000 + Math.random() * 9000);

    const user = await this.prisma.user.create({
      data: {
        isGuest: true,
        fullName: `Guest ${suffix}`,
        username: `guest${suffix}${Date.now().toString(36)}`,
      },
    });

    await this.seedStarterContent(user.id);

    return { user, token: this.sign(user.id) };
  }

  sign(userId: string) {
    return this.jwt.sign({ sub: userId });
  }

  private async seedStarterContent(ownerId: string) {
    const project = await this.prisma.project.create({
      data: { name: 'Design Homepage', ownerId, leadId: ownerId, order: 0 },
    });

    await this.prisma.task.createMany({
      data: [
        {
          title: 'Design Homepage',
          description: 'Lay out the marketing homepage and hand off to engineering.',
          status: 'TODO',
          priority: 'HIGH',
          order: 0,
          ownerId,
          projectId: project.id,
        },
        {
          title: 'Develop Login Feature',
          status: 'TODO',
          priority: 'LOW',
          order: 1,
          ownerId,
          projectId: project.id,
        },
        {
          title: 'Test Payment Gateway',
          status: 'DOING',
          priority: 'MEDIUM',
          order: 0,
          ownerId,
          projectId: project.id,
        },
        {
          title: 'Write API Documentation',
          description:
            'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
          status: 'BACKLOG',
          priority: 'HIGH',
          order: 0,
          ownerId,
          projectId: project.id,
        },
      ],
    });
  }
}
