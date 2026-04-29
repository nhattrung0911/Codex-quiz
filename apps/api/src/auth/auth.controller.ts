import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from '../shared/current-user.decorator';
import { Public } from '../shared/public.decorator';
import type { AuthUser } from '../shared/roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const session = this.auth.login(body.email, body.password);
    res.cookie('qf_refresh', 'session-ready-placeholder', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return session;
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('qf_refresh');
  }
}
