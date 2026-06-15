import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  private async resolveOrganizationId(request: any) {
    const orgId = request.params?.orgId;

    if (orgId) {
      return orgId;
    }

    const projectId = request.params?.projectId;
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true },
      });

      return project?.organizationId || null;
    }

    const taskId = request.params?.taskId;
    if (taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        select: {
          project: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      return task?.project.organizationId || null;
    }

    const noteId = request.params?.noteId;
    if (noteId) {
      const note = await this.prisma.note.findUnique({
        where: { id: noteId },
        select: { organizationId: true },
      });

      return note?.organizationId || null;
    }

    return null;
  }

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
    const organizationId = await this.resolveOrganizationId(request);

    const membership = organizationId
      ? await this.prisma.membership.findFirst({
          where: {
            userId: user.sub,
            organizationId,
          },
        })
      : await this.prisma.membership.findFirst({
          where: {
            userId: user.sub,
            role: {
              in: requiredRoles as any,
            },
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
