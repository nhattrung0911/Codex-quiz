import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { RbacGuard } from '../src/shared/rbac.guard';

function contextWithRole(role?: string) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined })
    })
  } as never;
}

describe('RbacGuard', () => {
  it('allows matching roles and rejects mismatched roles', () => {
    const reflector = {
      getAllAndOverride: () => ['admin']
    } as unknown as Reflector;
    const guard = new RbacGuard(reflector);

    expect(guard.canActivate(contextWithRole('admin'))).toBe(true);
    expect(() => guard.canActivate(contextWithRole('student'))).toThrow('Insufficient role');
  });
});
