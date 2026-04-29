import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataStore, type UserRecord } from '../shared/data-store';
import { loadEnv } from '../shared/env';

@Injectable()
export class AuthService {
  constructor(
    private readonly data: DataStore,
    private readonly jwt: JwtService
  ) {}

  login(email: string, password: string) {
    const user = this.data.findUser(email);
    if (!user || user.password !== password) throw new UnauthorizedException('Invalid credentials');
    return this.sessionFor(user);
  }

  sessionFor(user: UserRecord) {
    const env = loadEnv();
    const accessToken = this.jwt.sign({
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        orgId: user.orgId,
        name: user.name,
        email: user.email,
        role: user.role
      },
      organization: this.data.organization,
      tokens: {
        accessToken,
        expiresAt: new Date(Date.now() + env.ACCESS_TOKEN_TTL_SECONDS * 1000).toISOString()
      }
    };
  }

  me(userId: string) {
    const user = this.data.users.find((candidate) => candidate.id === userId);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return this.sessionFor(user);
  }
}
