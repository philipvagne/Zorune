import { ForbiddenException, Injectable } from '@nestjs/common';
import { Membership, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationAuthorizationService {
  private readonly contributorRoles: Role[] = [
    Role.OWNER,
    Role.ADMIN,
    Role.MEMBER,
  ];

  private readonly managerRoles: Role[] = [Role.OWNER, Role.ADMIN];

  constructor(private readonly prisma: PrismaService) {}

  canContribute(role: Role) {
    return this.contributorRoles.includes(role);
  }

  canManage(role: Role) {
    return this.managerRoles.includes(role);
  }

  assertContributorRole(
    role: Role,
    message = 'Only contributors can modify this resource',
  ) {
    if (!this.canContribute(role)) {
      throw new ForbiddenException(message);
    }
  }

  assertManagerRole(
    role: Role,
    message = 'Only organization owners or admins can manage this resource',
  ) {
    if (!this.canManage(role)) {
      throw new ForbiddenException(message);
    }
  }

  async requireMembership(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not allowed in this organization');
    }

    return membership;
  }

  async requireContributor(
    userId: string,
    organizationId: string,
    message = 'Only contributors can modify this resource',
  ) {
    const membership = await this.requireMembership(userId, organizationId);
    this.assertContributorRole(membership.role, message);
    return membership;
  }

  async requireManager(
    userId: string,
    organizationId: string,
    message = 'Only organization owners or admins can manage this resource',
  ) {
    const membership = await this.requireMembership(userId, organizationId);
    this.assertManagerRole(membership.role, message);
    return membership;
  }
}
