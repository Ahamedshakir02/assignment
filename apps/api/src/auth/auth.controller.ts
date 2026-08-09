import { Controller, Post, Get, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AUTH_COOKIE } from './jwt.strategy';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a guest session' })
  async guest(@Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.loginAsGuest();
    this.setCookie(res, token);
    return { user };
  }

  @Get('me')
  @ApiOperation({ summary: 'Current session user' })
  async me(@CurrentUser() authUser: AuthUser) {
    const user = await this.prisma.user.findUnique({ where: { id: authUser.id } });
    return { user };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, this.cookieOptions());
  }

  private setCookie(res: Response, token: string) {
    res.cookie(AUTH_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: THIRTY_DAYS_MS,
    });
  }

  private cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      // Web and API are on different domains in production, so the cookie has
      // to be SameSite=None + Secure to survive the cross-site request.
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      secure: isProd,
      path: '/',
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    };
  }
}
