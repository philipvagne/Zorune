import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async search(userId: string, query: string) {
    const q = query.trim();

    if (!q) {
      return [];
    }

    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { organizationId: true },
    });

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    if (organizationIds.length === 0) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organizationId: {
              in: organizationIds,
            },
          },
        },
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
      },
      take: 10,
      orderBy: [{ fullName: 'asc' }, { username: 'asc' }, { email: 'asc' }],
    });
  }
}
