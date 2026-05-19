import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class OrganizationsService {
  async getOrganization(orgId: string, userId: string) {
    const membership = await prisma.membership.findFirst({
      where: {
        organizationId: orgId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not belong to this organization',
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: orgId,
      },
    });

    return organization;
  }
}