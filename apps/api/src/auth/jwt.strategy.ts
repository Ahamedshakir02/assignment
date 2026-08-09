import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export const AUTH_COOKIE = 'pyramid_token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      // Cookie first (browser), Bearer second (Swagger / curl).
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[AUTH_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-only-insecure-secret',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isGuest: true },
    });

    // A token can outlive its user (cleared database, deleted guest).
    if (!user) throw new UnauthorizedException('Session no longer valid');

    return user;
  }
}
