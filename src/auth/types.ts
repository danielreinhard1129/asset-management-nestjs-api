import { Role } from '@prisma/client';

export interface PayloadToken {
  id: number;
  role: Role;
  iat: number;
  exp: number;
}
