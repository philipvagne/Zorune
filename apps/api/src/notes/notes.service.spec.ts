import { ForbiddenException } from '@nestjs/common';
import { NoteKind, Role, TaskStatus } from '@prisma/client';
import { OrganizationAuthorizationService } from '../auth/organization-authorization.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotesService } from './notes.service';

describe('NotesService authorization', () => {
  let service: NotesService;
  let prisma: any;
  let organizationAuthorization: jest.Mocked<OrganizationAuthorizationService>;
  let notificationsGateway: jest.Mocked<NotificationsGateway>;

  const linkedState = (id: string, email: string) => ({
    id,
    title: `Note ${id}`,
    kind: NoteKind.NOTE,
    isPinned: false,
    pinnedAt: null,
    organizationId: 'org-1',
    projectId: null,
    taskId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { id: `user-${id}`, email },
    project: null,
    task: null,
    sourceLinks: [],
    targetLinks: [],
  });

  beforeEach(() => {
    prisma = {
      note: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      noteLink: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
      },
      taskAssignment: {
        findMany: jest.fn(),
      },
      taskNoteReadState: {
        upsert: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
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

    service = new NotesService(
      prisma,
      organizationAuthorization,
      notificationsGateway,
    );
  });

  it('denies VIEWER users from creating notes', async () => {
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can modify notes'),
    );

    await expect(
      service.createNote('user-1', {
        title: 'Note title',
        organizationId: 'org-1',
      }),
    ).rejects.toThrow('Only contributors can modify notes');

    expect(prisma.note.create).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to create notes', async () => {
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.note.create.mockResolvedValue({
      id: 'note-1',
      title: 'Note title',
    });

    await expect(
      service.createNote('user-1', {
        title: 'Note title',
        organizationId: 'org-1',
      }),
    ).resolves.toMatchObject({ id: 'note-1' });

    expect(prisma.note.create).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])('allows %s users to create notes', async (role) => {
    organizationAuthorization.requireContributor.mockResolvedValue({
      role,
    } as any);
    prisma.note.create.mockResolvedValue({
      id: 'note-1',
      title: 'Note title',
    });

    await expect(
      service.createNote('user-1', {
        title: 'Note title',
        organizationId: 'org-1',
      }),
    ).resolves.toMatchObject({ id: 'note-1' });
  });

  it('denies VIEWER users from updating notes', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can modify notes'),
    );

    await expect(
      service.updateNote('note-1', 'user-1', { title: 'Updated note' }),
    ).rejects.toThrow('Only contributors can modify notes');

    expect(prisma.note.update).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to update notes', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      organizationId: 'org-1',
      projectId: null,
      taskId: null,
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.note.update.mockResolvedValue({
      id: 'note-1',
      title: 'Updated note',
    });

    await expect(
      service.updateNote('note-1', 'user-1', { title: 'Updated note' }),
    ).resolves.toMatchObject({ id: 'note-1' });

    expect(prisma.note.update).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])('allows %s users to update notes', async (role) => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      organizationId: 'org-1',
      projectId: null,
      taskId: null,
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role,
    } as any);
    prisma.note.update.mockResolvedValue({
      id: 'note-1',
      title: 'Updated note',
    });

    await expect(
      service.updateNote('note-1', 'user-1', { title: 'Updated note' }),
    ).resolves.toMatchObject({ id: 'note-1' });
  });

  it('denies VIEWER users from deleting notes', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can modify notes'),
    );

    await expect(service.deleteNote('note-1', 'user-1')).rejects.toThrow(
      'Only contributors can modify notes',
    );

    expect(prisma.note.delete).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to delete notes', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.note.delete.mockResolvedValue({
      id: 'note-1',
    });

    await expect(service.deleteNote('note-1', 'user-1')).resolves.toMatchObject({
      id: 'note-1',
    });

    expect(prisma.note.delete).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])('allows %s users to delete notes', async (role) => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role,
    } as any);
    prisma.note.delete.mockResolvedValue({
      id: 'note-1',
    });

    await expect(service.deleteNote('note-1', 'user-1')).resolves.toMatchObject({
      id: 'note-1',
    });
  });

  it('denies VIEWER users from adding note links', async () => {
    prisma.note.findUnique
      .mockResolvedValueOnce({
        id: 'note-1',
        organizationId: 'org-1',
      })
      .mockResolvedValueOnce({
        id: 'note-2',
        organizationId: 'org-1',
      });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can modify notes'),
    );

    await expect(
      service.addNoteLink('note-1', 'note-2', 'user-1'),
    ).rejects.toThrow('Only contributors can modify notes');

    expect(prisma.noteLink.create).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to add note links', async () => {
    prisma.note.findUnique
      .mockResolvedValueOnce({
        id: 'note-1',
        organizationId: 'org-1',
      })
      .mockResolvedValueOnce({
        id: 'note-2',
        organizationId: 'org-1',
      });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.noteLink.findFirst.mockResolvedValue(null);
    prisma.noteLink.create.mockResolvedValue({ id: 'link-1' });
    prisma.note.findUniqueOrThrow
      .mockResolvedValueOnce(linkedState('note-1', 'one@example.com'))
      .mockResolvedValueOnce(linkedState('note-2', 'two@example.com'));

    await expect(
      service.addNoteLink('note-1', 'note-2', 'user-1'),
    ).resolves.toMatchObject({
      sourceNote: { id: 'note-1' },
      linkedNote: { id: 'note-2' },
    });

    expect(prisma.noteLink.create).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])('allows %s users to add note links', async (role) => {
    prisma.note.findUnique
      .mockResolvedValueOnce({
        id: 'note-1',
        organizationId: 'org-1',
      })
      .mockResolvedValueOnce({
        id: 'note-2',
        organizationId: 'org-1',
      });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role,
    } as any);
    prisma.noteLink.findFirst.mockResolvedValue(null);
    prisma.noteLink.create.mockResolvedValue({ id: 'link-1' });
    prisma.note.findUniqueOrThrow
      .mockResolvedValueOnce(linkedState('note-1', 'one@example.com'))
      .mockResolvedValueOnce(linkedState('note-2', 'two@example.com'));

    await expect(
      service.addNoteLink('note-1', 'note-2', 'user-1'),
    ).resolves.toMatchObject({
      sourceNote: { id: 'note-1' },
      linkedNote: { id: 'note-2' },
    });
  });

  it('denies VIEWER users from removing note links', async () => {
    prisma.note.findUnique
      .mockResolvedValueOnce({
        id: 'note-1',
        organizationId: 'org-1',
      })
      .mockResolvedValueOnce({
        id: 'note-2',
        organizationId: 'org-1',
      });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    organizationAuthorization.requireContributor.mockRejectedValue(
      new ForbiddenException('Only contributors can modify notes'),
    );

    await expect(
      service.removeNoteLink('note-1', 'note-2', 'user-1'),
    ).rejects.toThrow('Only contributors can modify notes');

    expect(prisma.noteLink.deleteMany).not.toHaveBeenCalled();
  });

  it('allows MEMBER users to remove note links', async () => {
    prisma.note.findUnique
      .mockResolvedValueOnce({
        id: 'note-1',
        organizationId: 'org-1',
      })
      .mockResolvedValueOnce({
        id: 'note-2',
        organizationId: 'org-1',
      });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    organizationAuthorization.requireContributor.mockResolvedValue({
      role: Role.MEMBER,
    } as any);
    prisma.noteLink.deleteMany.mockResolvedValue({ count: 1 });
    prisma.note.findUniqueOrThrow
      .mockResolvedValueOnce(linkedState('note-1', 'one@example.com'))
      .mockResolvedValueOnce(linkedState('note-2', 'two@example.com'));

    await expect(
      service.removeNoteLink('note-1', 'note-2', 'user-1'),
    ).resolves.toMatchObject({
      removed: true,
      sourceNote: { id: 'note-1' },
      linkedNote: { id: 'note-2' },
    });

    expect(prisma.noteLink.deleteMany).toHaveBeenCalled();
  });

  it.each([Role.ADMIN, Role.OWNER])(
    'allows %s users to remove note links',
    async (role) => {
      prisma.note.findUnique
        .mockResolvedValueOnce({
          id: 'note-1',
          organizationId: 'org-1',
        })
        .mockResolvedValueOnce({
          id: 'note-2',
          organizationId: 'org-1',
        });
      organizationAuthorization.requireMembership.mockResolvedValue({
        role,
      } as any);
      organizationAuthorization.requireContributor.mockResolvedValue({
        role,
      } as any);
      prisma.noteLink.deleteMany.mockResolvedValue({ count: 1 });
      prisma.note.findUniqueOrThrow
        .mockResolvedValueOnce(linkedState('note-1', 'one@example.com'))
        .mockResolvedValueOnce(linkedState('note-2', 'two@example.com'));

      await expect(
        service.removeNoteLink('note-1', 'note-2', 'user-1'),
      ).resolves.toMatchObject({
        removed: true,
        sourceNote: { id: 'note-1' },
        linkedNote: { id: 'note-2' },
      });
    },
  );

  it('allows VIEWER users to read notes list', async () => {
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.note.findMany.mockResolvedValue([
      {
        id: 'note-1',
        title: 'Note title',
        kind: NoteKind.NOTE,
      },
    ]);

    await expect(
      service.getNotes('user-1', { organizationId: 'org-1' }),
    ).resolves.toEqual([
      {
        id: 'note-1',
        title: 'Note title',
        kind: NoteKind.NOTE,
      },
    ]);
  });

  it('allows VIEWER users to read a note', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      title: 'Note title',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);

    await expect(service.getNote('note-1', 'user-1')).resolves.toMatchObject({
      id: 'note-1',
    });
  });

  it('allows VIEWER users to read task notes', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      projectId: 'project-1',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.note.findMany.mockResolvedValue([
      {
        id: 'note-1',
        title: 'Task note',
        kind: NoteKind.NOTE,
      },
    ]);

    await expect(service.getTaskNotes('user-1', 'task-1')).resolves.toEqual([
      {
        id: 'note-1',
        title: 'Task note',
        kind: NoteKind.NOTE,
      },
    ]);
  });

  it('allows VIEWER users to read note links', async () => {
    prisma.note.findUnique.mockResolvedValue({
      id: 'note-1',
      title: 'Source note',
      organizationId: 'org-1',
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.noteLink.findMany
      .mockResolvedValueOnce([
        {
          targetNote: {
            id: 'note-2',
            title: 'Linked note',
            kind: NoteKind.NOTE,
            isPinned: false,
            pinnedAt: null,
            organizationId: 'org-1',
            projectId: null,
            taskId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: {
              id: 'user-2',
              email: 'test@example.com',
              username: null,
              fullName: null,
            },
            project: null,
            task: null,
          },
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(service.getNoteLinks('note-1', 'user-1')).resolves.toHaveLength(1);
  });

  it('allows VIEWER users to mark task notes seen', async () => {
    prisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      project: {
        organizationId: 'org-1',
      },
    });
    organizationAuthorization.requireMembership.mockResolvedValue({
      role: Role.VIEWER,
    } as any);
    prisma.taskNoteReadState.upsert.mockResolvedValue({
      id: 'read-state-1',
      taskId: 'task-1',
      userId: 'user-1',
      lastSeenAt: new Date(),
    });
    prisma.task.findUnique.mockResolvedValueOnce({
      id: 'task-1',
      project: {
        organizationId: 'org-1',
      },
    });
    prisma.task.findUnique.mockResolvedValueOnce({
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
    });

    await expect(
      service.markTaskNotesSeen('user-1', 'task-1'),
    ).resolves.toMatchObject({
      id: 'read-state-1',
      taskId: 'task-1',
    });
  });
});
