import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

const prisma = new PrismaClient();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // If route has no roles, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.sub,
      },
    });

    if (!membership) {
      throw new ForbiddenException('No membership found');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}