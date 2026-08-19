import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Used as Railway's healthcheck and by an external uptime pinger — the
   * repository has to stay reachable for 45 days after submission.
   *
   * Checks the database as well as the process: a service that is running but
   * cannot reach Postgres is not actually healthy, and reporting it as such
   * would defeat the point.
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness and database connectivity' })
  async check() {
    const startedAt = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'up',
        latencyMs: Date.now() - startedAt,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Deliberately no error detail — this endpoint is public and connection
      // strings turn up in Prisma error messages.
      return {
        status: 'degraded',
        database: 'down',
        latencyMs: Date.now() - startedAt,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
