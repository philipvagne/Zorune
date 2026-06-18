import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { OrganizationAuthorizationService } from './organization-authorization.service';

describe('OrganizationAuthorizationService', () => {
  let service: OrganizationAuthorizationService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      membership: {
        findFirst: jest.fn(),
      },
    };

    service = new OrganizationAuthorizationService(prisma);
  });

  it('allows contributor roles', () => {
    expect(service.canContribute(Role.OWNER)).toBe(true);
    expect(service.canContribute(Role.ADMIN)).toBe(true);
    expect(service.canContribute(Role.MEMBER)).toBe(true);
    expect(service.canContribute(Role.VIEWER)).toBe(false);
  });

  it('allows manager roles only for owner and admin', () => {
    expect(service.canManage(Role.OWNER)).toBe(true);
    expect(service.canManage(Role.ADMIN)).toBe(true);
    expect(service.canManage(Role.MEMBER)).toBe(false);
    expect(service.canManage(Role.VIEWER)).toBe(false);
  });

  it('assertManagerRole allows OWNER', () => {
    expect(() => service.assertManagerRole(Role.OWNER)).not.toThrow();
  });

  it('assertManagerRole allows ADMIN', () => {
    expect(() => service.assertManagerRole(Role.ADMIN)).not.toThrow();
  });

  it('returns membership for requireMembership', async () => {
    const membership = {
      id: 'membership-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: Role.MEMBER,
    };
    prisma.membership.findFirst.mockResolvedValue(membership);

    await expect(service.requireMembership('user-1', 'org-1')).resolves.toBe(
      membership,
    );
  });

  it('denies non-members in requireMembership', async () => {
    prisma.membership.findFirst.mockResolvedValue(null);

    await expect(
      service.requireMembership('user-1', 'org-1'),
    ).rejects.toThrow('Not allowed in this organization');
  });

  it('requireContributor allows OWNER', async () => {
    const membership = {
      id: 'membership-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: Role.OWNER,
    };
    prisma.membership.findFirst.mockResolvedValue(membership);

    await expect(service.requireContributor('user-1', 'org-1')).resolves.toBe(
      membership,
    );
  });

  it('requireContributor allows ADMIN', async () => {
    const membership = {
      id: 'membership-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: Role.ADMIN,
    };
    prisma.membership.findFirst.mockResolvedValue(membership);

    await expect(service.requireContributor('user-1', 'org-1')).resolves.toBe(
      membership,
    );
  });

  it('requireContributor allows MEMBER', async () => {
    const membership = {
      id: 'membership-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: Role.MEMBER,
    };
    prisma.membership.findFirst.mockResolvedValue(membership);

    await expect(service.requireContributor('user-1', 'org-1')).resolves.toBe(
      membership,
    );
  });

  it('explicitly denies VIEWER in requireContributor', async () => {
    prisma.membership.findFirst.mockResolvedValue({
      id: 'membership-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: Role.VIEWER,
    });

    await expect(
      service.requireContributor(
        'user-1',
        'org-1',
        'Only contributors can modify this resource',
      ),
    ).rejects.toThrow('Only contributors can modify this resource');
  });

  it('requireContributor denies non-members', async () => {
    prisma.membership.findFirst.mockResolvedValue(null);

    await expect(
      service.requireContributor(
        'user-1',
        'org-1',
        'Only contributors can modify this resource',
      ),
    ).rejects.toThrow('Not allowed in this organization');
  });

  it('returns membership for requireManager when role can manage', async () => {
    const membership = {
      id: 'membership-1',
      userId: 'user-1',
      organizationId: 'org-1',
      role: Role.ADMIN,
    };
    prisma.membership.findFirst.mockResolvedValue(membership);

    await expect(service.requireManager('user-1', 'org-1')).resolves.toBe(
      membership,
    );
  });

  it('assertManagerRole denies non-manager roles', () => {
    expect(() =>
      service.assertManagerRole(
        Role.MEMBER,
        'Only organization owners or admins can manage this resource',
      ),
    ).toThrow(ForbiddenException);

    expect(() =>
      service.assertManagerRole(
        Role.VIEWER,
        'Only organization owners or admins can manage this resource',
      ),
    ).toThrow(ForbiddenException);
  });
});
