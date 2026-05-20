import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class ProjectsService { constructor(private prisma: PrismaService) {}

  async createProject(orgId: string, userId: string, name: string, description?: string) {
    // 1. Check membership (TENANT SECURITY)
    const membership = await this.prisma.membership.findFirst({
      where: {
        organizationId: orgId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not allowed in this organization');
    }

    // 2. Create project
    const project = await this.prisma.project.create({
      data: {
        name,
        description,
        organizationId: orgId,
      },
    });

    return project;
  }

  async getProjects(orgId: string, userId: string) {
    // 1. Check membership
    const membership = await this.prisma.membership.findFirst({
      where: {
        organizationId: orgId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not allowed in this organization');
    }

    // 2. Return projects for org
    return this.prisma.project.findMany({
      where: {
        organizationId: orgId,
      },
    });
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    // 3. Check membership in org
    const membership = await this.prisma.membership.findFirst({
      where: {
        organizationId: project.organizationId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not allowed');
    }

    return project;
  }
}