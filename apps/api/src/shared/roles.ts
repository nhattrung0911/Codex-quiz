export type Role = 'admin' | 'instructor' | 'student' | 'proctor';

export interface AuthUser {
  id: string;
  orgId: string;
  email: string;
  role: Role;
}
