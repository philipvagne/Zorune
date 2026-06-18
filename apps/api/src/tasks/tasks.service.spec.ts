import { ForbiddenException } from '@nestjs/common';
import { Role, TaskStatus } from '@prisma/client';
import { OrganizationAuthorizationService } from '../auth/organization-authorization.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { TasksService } from './tasks.service';

describe('TasksService authorization', () => {
  let service: TasksService;
  let prisma: any;
  let organizationAuthorization: jest.Mocked<OrganizationAuthorizationService>;
  let notificationsGateway: jest.Mocked<NotificationsGateway>;

  const buildTaskSummary = (overrides: Record<string, any> = {}) => ({
    id: 'task-1',
    title: 'Task title',
    status: TaskStatus.TODO,
    archivedAt: null,
    dueDate: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    project: {
      id: 'project-1',
      name: 'Project',
      organizationId: 'org-1',
    },
    assignments: [],
    ...overrides,
  });

  const buildTaskPayloadTask = (overrides: Record<string, any> = {}) => ({
    ...buildTaskSummary(),
    notes: [],
    updates: [],
    noteReadStates: [],
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      project: {
        findUnique: jest.fn(),
      },
      task: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      taskUpdate: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      taskAssignment: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      taskNoteReadState: {
        upsert: jest.fn(),
      },
      notification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      membership: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(async (callback: any) =>
        callback({
          taskAssignment: {
            upsert: prisma.taskAssignment.upsert,
            deleteMany: prisma.taskAssignment.deleteMany,
          },
          notification: {
            create: prisma.notification.create,
          },
        }),
      ),
    };

    organizationAuthorization = {
      requireMembership: jest.fn(),
      requireContributor: jest.fn(),
      requireManager: jest.fn(),
      canContribute: jest.fn(),
      canManage: jest.fn(),
      assertContributorRole: jest.fn(),
      assertManagerRole: jest.fn(),
    } as unknown as jest.Mocked<OrganizationAuthorizationService>;

    notificationsGateway = {
      sendNotification: jest.fn(),
      emitTaskUpdated: jest.fn(),
      emitTaskUpdatedToUser: jest.fn(),
      emitTaskUpdateCreated: jest.fn(),
    } as unknown as jest.Mocked<NotificationsGateway>;

    service = new TasksService(
      prisma,
      organizationAuthorization,
      notificationsGateway,
    );
  });

  it('denies VIEWER users from creating tasks', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can create tasks'),
    );

    await expect(
      service.createTask('org-1', 'project-1', 'user-1', 'Task title'),
    ).rejects.toThrow('Only contributors can create tasks');

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to create tasks', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.task.create.mockResolvedValue({ id: 'task-1', title: 'Task title' });

    await expect(
      service.createTask('org-1', 'project-1', 'user-1', 'Task title'),
    ).resolves.toMatchObject({ id: 'task-1' });

    expect(prisma.task.create).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])(
    'allows %s users to create tasks',
    async (role) => {
      prisma.project.findUnique.mockResolvedValue({
        id: 'project-1',
        organizationId: 'org-1',
      });
      organizationAuthorization.requireContributor.mockResolvedValue({
        role,
      } as any);
      prisma.task.create.mockResolvedValue({ id: 'task-1', title: 'Task title' });

      await expect(
        service.createTask('org-1', 'project-1', 'user-1', 'Task title'),
      ).resolves.toMatchObject({ id: 'task-1' });
    },
  );

  it('denies VIEWER users from updating tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      status: TaskStatus.TODO,
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can update tasks'),
    );

    await expect(
      service.updateTask('user-1', 'task-1', { title: 'Updated' }),
    ).rejects.toThrow('Only contributors can update tasks');

    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to update tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      status: TaskStatus.TODO,
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.task.update.mockResolvedValue({
      id: 'task-1',
      title: 'Updated task',
    });
    prisma.membership.findMany.mockResolvedValue([]);

    await expect(
      service.updateTask('user-1', 'task-1', { title: 'Updated task' }),
    ).resolves.toMatchObject({ id: 'task-1' });

    expect(prisma.task.update).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])(
    'allows %s users to update tasks',
    async (role) => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.TODO,
        project: {
          organizationId: 'org-1',
        },
      });
      organizationAuthorization.requireContributor.mockResolvedValue({
        role,
      } as any);
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        title: 'Updated task',
      });
      prisma.membership.findMany.mockResolvedValue([]);

      await expect(
        service.updateTask('user-1', 'task-1', { title: 'Updated task' }),
      ).resolves.toMatchObject({ id: 'task-1' });
    },
  );

  it('denies VIEWER users from deleting tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can delete tasks'),
    );

    await expect(service.deleteTask('user-1', 'task-1')).rejects.toThrow(
      'Only contributors can delete tasks',
    );

    expect(prisma.task.delete).not.toHaveBeenCalled();
  });

  it.each([Role.MEMBER, Role.ADMIN, Role.OWNER])(
    'allows %s users to delete tasks',
    async (role) => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        project: {
          organizationId: 'org-1',
        },
      });
      organizationAuthorization.requireContributor.mockResolvedValue({
        role,
      } as any);
      prisma.task.delete.mockResolvedValue({ id: 'task-1' });

      await expect(service.deleteTask('user-1', 'task-1')).resolves.toMatchObject(
        { message: 'Task deleted successfully' },
      );
    },
  );

  it('denies VIEWER users from archiving tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      status: TaskStatus.DONE,
      archivedAt: null,
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.assertContributorRole.mockImplementation(() => {
      throw new ForbiddenException('Only contributors can archive tasks');
    });

    await expect(service.archiveTask('user-1', 'task-1')).rejects.toThrow(
      'Only contributors can archive tasks',
    );

    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to archive tasks', async () => {
    prisma.task.findUnique
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.DONE,
        archivedAt: null,
        project: {
          organizationId: 'org-1',
        },
      })
      .mockResolvedValueOnce(
        buildTaskSummary({
          status: TaskStatus.DONE,
          archivedAt: new Date(),
        }),
      )
      .mockResolvedValueOnce(
        buildTaskPayloadTask({
          status: TaskStatus.DONE,
          archivedAt: new Date(),
        }),
      );
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.task.update.mockResolvedValue({ id: 'task-1', archivedAt: new Date() });
    prisma.activityLog.create.mockResolvedValue({ id: 'log-1' });
    prisma.taskAssignment.findMany.mockResolvedValue([]);
    prisma.membership.findMany.mockResolvedValue([]);

    await expect(service.archiveTask('user-1', 'task-1')).resolves.toMatchObject(
      { id: 'task-1' },
    );

    expect(prisma.task.update).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])(
    'allows %s users to archive tasks',
    async (role) => {
      prisma.task.findUnique
        .mockResolvedValueOnce({
          id: 'task-1',
          title: 'Task title',
          status: TaskStatus.DONE,
          archivedAt: null,
          project: {
            organizationId: 'org-1',
          },
        })
        .mockResolvedValueOnce(
          buildTaskSummary({
            status: TaskStatus.DONE,
            archivedAt: new Date(),
          }),
        )
        .mockResolvedValueOnce(
          buildTaskPayloadTask({
            status: TaskStatus.DONE,
            archivedAt: new Date(),
          }),
        );
      organizationAuthorization.requireMembership.mockResolvedValue({
        role,
      } as any);
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        archivedAt: new Date(),
      });
      prisma.activityLog.create.mockResolvedValue({ id: 'log-1' });
      prisma.taskAssignment.findMany.mockResolvedValue([]);
      prisma.membership.findMany.mockResolvedValue([]);

      await expect(service.archiveTask('user-1', 'task-1')).resolves.toMatchObject(
        { id: 'task-1' },
      );
    },
  );

  it('denies VIEWER users from restoring tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      archivedAt: new Date(),
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.assertContributorRole.mockImplementation(() => {
      throw new ForbiddenException('Only contributors can restore tasks');
    });

    await expect(service.restoreTask('user-1', 'task-1')).rejects.toThrow(
      'Only contributors can restore tasks',
    );

    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to restore tasks', async () => {
    const restoredAt = new Date();
    prisma.task.findUnique
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        archivedAt: restoredAt,
        project: {
          organizationId: 'org-1',
        },
      })
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.TODO,
        archivedAt: null,
        dueDate: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-1',
          name: 'Project',
          organizationId: 'org-1',
        },
        assignments: [],
      })
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.TODO,
        archivedAt: null,
        dueDate: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-1',
          name: 'Project',
          organizationId: 'org-1',
        },
        assignments: [],
        notes: [],
        updates: [],
        noteReadStates: [],
      });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.task.update.mockResolvedValue({ id: 'task-1', archivedAt: null });
    prisma.membership.findMany.mockResolvedValue([]);
    prisma.activityLog.create.mockResolvedValue({ id: 'log-1' });

    await expect(service.restoreTask('user-1', 'task-1')).resolves.toMatchObject(
      { id: 'task-1', archivedAt: null },
    );

    expect(prisma.task.update).toHaveBeenCalled();
  });

  it('denies VIEWER users from assigning tasks', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can assign tasks'),
    );

    await expect(
      service.assignTask('user-1', 'task-1', 'user-2'),
    ).rejects.toThrow('Only contributors can assign tasks');

    expect(prisma.taskAssignment.upsert).not.toHaveBeenCalled();
  });

  it.each([Role.MEMBER, Role.ADMIN, Role.OWNER])(
    'allows %s users to assign tasks',
    async (role) => {
      prisma.task.findUnique
        .mockResolvedValueOnce({
          id: 'task-1',
          title: 'Task title',
          project: {
            organizationId: 'org-1',
          },
        })
        .mockResolvedValueOnce(buildTaskSummary())
        .mockResolvedValueOnce(buildTaskPayloadTask());
      organizationAuthorization.requireContributor.mockResolvedValue({
        role,
      } as any);
      prisma.membership.findFirst.mockResolvedValue({ id: 'membership-2' });
      prisma.notification.create.mockResolvedValue({ id: 'notification-1' });
      prisma.membership.findMany.mockResolvedValue([]);

      await expect(
        service.assignTask('user-1', 'task-1', 'user-2'),
      ).resolves.toMatchObject({ id: 'task-1' });

      expect(prisma.taskAssignment.upsert).toHaveBeenCalled();
    },
  );

  it('denies VIEWER users from removing assignees', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can change task assignments'),
    );

    await expect(
      service.removeAssignee('user-1', 'task-1', 'user-2'),
    ).rejects.toThrow('Only contributors can change task assignments');

    expect(prisma.taskAssignment.deleteMany).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to remove assignees', async () => {
    prisma.task.findUnique
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        project: {
          organizationId: 'org-1',
        },
      })
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.TODO,
        archivedAt: null,
        dueDate: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-1',
          name: 'Project',
          organizationId: 'org-1',
        },
        assignments: [],
      })
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.TODO,
        archivedAt: null,
        dueDate: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-1',
          name: 'Project',
          organizationId: 'org-1',
        },
        assignments: [],
        notes: [],
        updates: [],
        noteReadStates: [],
      });
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.notification.create.mockResolvedValue({ id: 'notification-1' });
    prisma.membership.findMany.mockResolvedValue([]);

    await expect(
      service.removeAssignee('user-1', 'task-1', 'user-2'),
    ).resolves.toMatchObject({ id: 'task-1' });

    expect(prisma.taskAssignment.deleteMany).toHaveBeenCalled();
  });

  it('denies VIEWER users from posting task updates', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task title',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.assertContributorRole.mockImplementation(() => {
      throw new ForbiddenException('Only contributors can post task updates');
    });

    await expect(
      service.createTaskUpdate('user-1', 'task-1', 'An update'),
    ).rejects.toThrow('Only contributors can post task updates');

    expect(prisma.taskUpdate.create).not.toHaveBeenCalled();
  });

  it.each([Role.MEMBER, Role.ADMIN, Role.OWNER])(
    'allows %s users to create task updates',
    async (role) => {
      prisma.task.findUnique
        .mockResolvedValueOnce({
          id: 'task-1',
          title: 'Task title',
          project: {
            organizationId: 'org-1',
          },
        })
        .mockResolvedValueOnce(buildTaskPayloadTask());
      organizationAuthorization.requireMembership.mockResolvedValue({
        role,
      } as any);
      prisma.taskUpdate.create.mockResolvedValue({
        id: 'update-1',
        message: 'An update',
        user: {
          id: 'user-1',
          fullName: 'Test User',
          username: 'tester',
          email: 'test@example.com',
        },
      });
      prisma.taskAssignment.findMany.mockResolvedValue([]);
      prisma.membership.findMany.mockResolvedValue([]);

      await expect(
        service.createTaskUpdate('user-1', 'task-1', 'An update'),
      ).resolves.toMatchObject({ id: 'update-1' });
    },
  );

  it('allows VIEWER users to read project tasks', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'project-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.task.findMany.mockResolvedValue([
      {
        id: 'task-1',
        title: 'Task title',
        status: TaskStatus.TODO,
        description: null,
        dueDate: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: {
          id: 'project-1',
          name: 'Project',
          organizationId: 'org-1',
        },
        assignments: [],
        notes: [],
        updates: [],
        noteReadStates: [],
      },
    ]);

    await expect(service.getTasks('user-1', 'project-1')).resolves.toHaveLength(1);

    expect(organizationAuthorization.requireMembership).toHaveBeenCalledWith(
      'user-1',
      'org-1',
    );
  });

  it('allows VIEWER users to read task updates', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.taskUpdate.findMany.mockResolvedValue([{ id: 'update-1' }]);

    await expect(service.getTaskUpdates('user-1', 'task-1')).resolves.toEqual([
      { id: 'update-1' },
    ]);
  });

  it('allows VIEWER users to read task activity', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.activityLog.count.mockResolvedValue(1);
    prisma.activityLog.findMany.mockResolvedValue([
      {
        id: 'event-1',
        action: 'TASK_STATUS_CHANGED',
        oldValue: 'TODO',
        newValue: 'DONE',
        createdAt: new Date(),
        user: {
          id: 'user-2',
          email: 'test@example.com',
        },
      },
    ]);

    await expect(
      service.getTaskActivity('user-1', 'task-1'),
    ).resolves.toMatchObject({
      events: [{ id: 'event-1' }],
      meta: { total: 1 },
    });
  });

  it('allows VIEWER users to read archived tasks list', async () => {
    prisma.task.findMany.mockResolvedValue([
      buildTaskPayloadTask({
        archivedAt: new Date(),
      }),
    ]);

    await expect(service.getArchivedTasks('user-1')).resolves.toHaveLength(1);
  });
});
