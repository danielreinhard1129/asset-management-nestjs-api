import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) {
      throw new UnauthorizedException();
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      const rolesList = requiredRoles.join(', ');
      throw new ForbiddenException(
        `You do not have the necessary role to access this resource. Required roles: ${rolesList}`,
      );
    }
    return true;
  }
}
