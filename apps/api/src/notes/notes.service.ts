import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoteKind, Prisma } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  private createdBySelect() {
    return {
      id: true,
      email: true,
      username: true,
      fullName: true,
    } as const;
  }

  private noteInclude() {
    return {
      createdBy: {
        select: this.createdBySelect(),
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          projectId: true,
        },
      },
      sourceLinks: {
        select: {
          targetNote: {
            select: {
              id: true,
              title: true,
              kind: true,
              project: {
                select: {
                  name: true,
                },
              },
              task: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
      targetLinks: {
        select: {
          sourceNote: {
            select: {
              id: true,
              title: true,
              kind: true,
              project: {
                select: {
                  name: true,
                },
              },
              task: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
    } as const;
  }

  private linkedNoteSelect() {
    return {
      id: true,
      title: true,
      content: true,
      kind: true,
      isPinned: true,
      pinnedAt: true,
      organizationId: true,
      projectId: true,
      taskId: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: this.createdBySelect(),
      },
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          projectId: true,
        },
      },
    } as const;
  }

  private noteLinkSummarySelect() {
    return {
      id: true,
      title: true,
      kind: true,
      isPinned: true,
      pinnedAt: true,
      organizationId: true,
      projectId: true,
      taskId: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: this.createdBySelect(),
      },
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          projectId: true,
        },
      },
    } as const;
  }

  private async getTaskAssignedUserIds(taskId: string) {
    const assignments = await this.prisma.taskAssignment.findMany({
      where: { taskId },
      select: { userId: true },
    });

    return [...new Set(assignments.map((assignment) => assignment.userId))];
  }

  private getRecentActivityAt(task: {
    updatedAt: Date;
    notes?: { createdAt: Date }[];
    updates?: { createdAt: Date }[];
  }) {
    const timestamps = [
      task.updatedAt?.getTime() || 0,
      ...(task.notes || []).map((note) => new Date(note.createdAt).getTime()),
      ...(task.updates || []).map((update) =>
        new Date(update.createdAt).getTime(),
      ),
    ];

    const latestTimestamp = Math.max(...timestamps);
    return latestTimestamp ? new Date(latestTimestamp) : task.updatedAt;
  }

  private isRecentlyActive(recentActivityAt: Date | null) {
    if (!recentActivityAt) {
      return false;
    }

    return (
      recentActivityAt.getTime() >
      Date.now() - 1000 * 60 * 60 * 24
    );
  }

  private async buildTaskAwarenessPayload(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        notes: {
          select: {
            id: true,
            createdAt: true,
            createdById: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        updates: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        noteReadStates: {
          where: {
            userId,
          },
          select: {
            lastSeenAt: true,
          },
          take: 1,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const lastSeenAt = task.noteReadStates[0]?.lastSeenAt || null;
    const unreadNoteCount = task.notes.filter((note) => {
      if (note.createdById === userId) {
        return false;
      }

      if (!lastSeenAt) {
        return true;
      }

      return new Date(note.createdAt).getTime() > lastSeenAt.getTime();
    }).length;

    return {
      taskId: task.id,
      status: task.status,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      archivedAt: task.archivedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project,
      assignments: task.assignments,
      unreadNoteCount,
      hasUnreadNotes: unreadNoteCount > 0,
      recentNoteActivityAt: task.notes[0]?.createdAt || null,
      recentActivityAt: this.getRecentActivityAt(task),
      isRecentlyActive: this.isRecentlyActive(this.getRecentActivityAt(task)),
    };
  }

  private async emitTaskAwarenessUpdate(taskId: string, userIds: string[]) {
    const uniqueUserIds = [...new Set(userIds)];

    for (const userId of uniqueUserIds) {
      const payload = await this.buildTaskAwarenessPayload(taskId, userId);
      this.notificationsGateway.emitTaskUpdatedToUser(userId, payload);
    }
  }

  private async requireMembership(userId: string, organizationId: string) {
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

  private async requireProjectInOrganization(
    projectId: string,
    organizationId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.organizationId !== organizationId) {
      throw new BadRequestException(
        'Project must belong to the note organization',
      );
    }

    return project;
  }

  private async requireTaskInOrganization(
    taskId: string,
    organizationId: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.organizationId !== organizationId) {
      throw new BadRequestException(
        'Task must belong to the note organization',
      );
    }

    return task;
  }

  private validateProjectTaskLink(projectId: string | null, taskProjectId: string) {
    if (projectId && projectId !== taskProjectId) {
      throw new BadRequestException(
        'Project must match the linked task project',
      );
    }
  }

  private async getAccessibleNote(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
      include: this.noteInclude(),
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.requireMembership(userId, note.organizationId);

    return note;
  }

  private async requireAccessibleNoteWithOrg(noteId: string, userId: string) {
    return this.getAccessibleNote(noteId, userId);
  }

  private async getConnectedNotes(noteId: string) {
    const [outgoingLinks, incomingLinks] = await Promise.all([
      this.prisma.noteLink.findMany({
        where: {
          sourceNoteId: noteId,
        },
        include: {
          targetNote: {
            select: this.linkedNoteSelect(),
          },
        },
      }),
      this.prisma.noteLink.findMany({
        where: {
          targetNoteId: noteId,
        },
        include: {
          sourceNote: {
            select: this.linkedNoteSelect(),
          },
        },
      }),
    ]);

    const connectedNotes = [
      ...outgoingLinks.map((link) => link.targetNote),
      ...incomingLinks.map((link) => link.sourceNote),
    ];

    const dedupedNotes = new Map<string, (typeof connectedNotes)[number]>();

    connectedNotes.forEach((linkedNote) => {
      dedupedNotes.set(linkedNote.id, linkedNote);
    });

    return [...dedupedNotes.values()].sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return left.isPinned ? -1 : 1;
      }

      const leftPinnedAt = left.pinnedAt
        ? new Date(left.pinnedAt).getTime()
        : 0;
      const rightPinnedAt = right.pinnedAt
        ? new Date(right.pinnedAt).getTime()
        : 0;

      if (leftPinnedAt !== rightPinnedAt) {
        return rightPinnedAt - leftPinnedAt;
      }

      const leftUpdatedAt = left.updatedAt
        ? new Date(left.updatedAt).getTime()
        : 0;
      const rightUpdatedAt = right.updatedAt
        ? new Date(right.updatedAt).getTime()
        : 0;

      if (leftUpdatedAt !== rightUpdatedAt) {
        return rightUpdatedAt - leftUpdatedAt;
      }

      const leftCreatedAt = left.createdAt
        ? new Date(left.createdAt).getTime()
        : 0;
      const rightCreatedAt = right.createdAt
        ? new Date(right.createdAt).getTime()
        : 0;

      return rightCreatedAt - leftCreatedAt;
    });
  }

  private async getLinkedStateForNote(noteId: string) {
    const note = await this.prisma.note.findUniqueOrThrow({
      where: {
        id: noteId,
      },
      select: {
        ...this.noteLinkSummarySelect(),
        sourceLinks: {
          select: {
            targetNote: {
              select: {
                id: true,
                title: true,
                kind: true,
                project: {
                  select: {
                    name: true,
                  },
                },
                task: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        targetLinks: {
          select: {
            sourceNote: {
              select: {
                id: true,
                title: true,
                kind: true,
                project: {
                  select: {
                    name: true,
                  },
                },
                task: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return note;
  }

  async getNotes(
    userId: string,
    filters: {
      organizationId?: string;
      projectId?: string;
      taskId?: string;
      kind?: string;
      q?: string;
    },
  ) {
    const where: Prisma.NoteWhereInput = {};
    const organizationId = filters.organizationId?.trim();
    const projectId = filters.projectId?.trim();
    const taskId = filters.taskId?.trim();
    const kind = filters.kind?.trim();
    const q = filters.q?.trim();
    const qLower = q?.toLowerCase() || '';

    if (organizationId) {
      await this.requireMembership(userId, organizationId);
      where.organizationId = organizationId;
    } else {
      where.organization = {
        memberships: {
          some: {
            userId,
          },
        },
      };
    }

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: {
          id: projectId,
        },
        select: {
          id: true,
          organizationId: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      await this.requireMembership(userId, project.organizationId);

      if (organizationId && project.organizationId !== organizationId) {
        throw new BadRequestException(
          'Project must belong to the requested organization',
        );
      }

      where.projectId = projectId;
    }

    if (taskId) {
      const task = await this.prisma.task.findUnique({
        where: {
          id: taskId,
        },
        select: {
          id: true,
          projectId: true,
          project: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      await this.requireMembership(userId, task.project.organizationId);

      if (organizationId && task.project.organizationId !== organizationId) {
        throw new BadRequestException(
          'Task must belong to the requested organization',
        );
      }

      if (projectId && task.projectId !== projectId) {
        throw new BadRequestException(
          'Project must match the requested task project',
        );
      }

      where.taskId = taskId;
    }

    if (q) {
      const matchingKinds = Object.values(NoteKind).filter((noteKind) =>
        noteKind.toLowerCase().includes(qLower),
      );

      where.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: q,
            mode: 'insensitive',
          },
        },
        ...matchingKinds.map((matchingKind) => ({
          kind: matchingKind,
        })),
      ];
    }

    if (kind) {
      if (!Object.values(NoteKind).includes(kind as NoteKind)) {
        throw new BadRequestException('Invalid note kind');
      }

      where.kind = kind as NoteKind;
    }

    return this.prisma.note.findMany({
      where,
      include: this.noteInclude(),
      orderBy: [
        {
          isPinned: 'desc',
        },
        {
          pinnedAt: 'desc',
        },
        {
          updatedAt: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async createNote(userId: string, body: CreateNoteDto) {
    const title = body.title?.trim();
    const organizationId = body.organizationId?.trim();
    const projectId = body.projectId?.trim() || null;
    const taskId = body.taskId?.trim() || null;
    const isPinned = body.isPinned === true;
    const kind = body.kind ?? NoteKind.NOTE;

    if (!title) {
      throw new BadRequestException('Note title is required');
    }

    if (!organizationId) {
      throw new BadRequestException('Organization is required');
    }

    await this.requireMembership(userId, organizationId);

    if (projectId) {
      await this.requireProjectInOrganization(projectId, organizationId);
    }

    let linkedTaskTitle: string | null = null;

    if (taskId) {
      const task = await this.requireTaskInOrganization(
        taskId,
        organizationId,
      );
      this.validateProjectTaskLink(projectId, task.projectId);
      linkedTaskTitle = task.title;
    }

    const note = await this.prisma.note.create({
      data: {
        title,
        content: body.content ?? '',
        kind,
        isPinned,
        pinnedAt: isPinned ? new Date() : null,
        organizationId,
        projectId,
        taskId,
        createdById: userId,
      },
      include: this.noteInclude(),
    });

    if (taskId && linkedTaskTitle) {
      await this.prisma.taskNoteReadState.upsert({
        where: {
          taskId_userId: {
            taskId,
            userId,
          },
        },
        update: {
          lastSeenAt: note.createdAt,
        },
        create: {
          taskId,
          userId,
          lastSeenAt: note.createdAt,
        },
      });

      const assignedUserIds = await this.getTaskAssignedUserIds(taskId);
      const recipientIds = assignedUserIds.filter(
        (assignedUserId) => assignedUserId !== userId,
      );

      for (const recipientId of recipientIds) {
        const notification = await this.prisma.notification.create({
          data: {
            type: 'TASK_NOTE_ADDED',
            message: `A note was added to "${linkedTaskTitle}"`,
            userId: recipientId,
            taskId,
          },
        });

        this.notificationsGateway.sendNotification(recipientId, {
          type: 'TASK_NOTE_ADDED',
          message: `A note was added to "${linkedTaskTitle}"`,
          taskId,
          notificationId: notification.id,
        });
      }

      await this.emitTaskAwarenessUpdate(taskId, assignedUserIds);
    }

    return note;
  }

  async getNote(noteId: string, userId: string) {
    return this.getAccessibleNote(noteId, userId);
  }

  async updateNote(noteId: string, userId: string, body: UpdateNoteDto) {
    const note = await this.getAccessibleNote(noteId, userId);
    const data: Prisma.NoteUpdateInput = {};
    let nextProjectId = note.projectId;
    let nextTaskId = note.taskId;

    if (body.title !== undefined) {
      const title = body.title.trim();

      if (!title) {
        throw new BadRequestException('Note title is required');
      }

      data.title = title;
    }

    if (body.content !== undefined) {
      data.content = body.content;
    }

    if (body.kind !== undefined) {
      data.kind = body.kind;
    }

    if (body.isPinned !== undefined) {
      data.isPinned = body.isPinned;
      data.pinnedAt = body.isPinned ? new Date() : null;
    }

    if (body.projectId !== undefined) {
      const projectId = body.projectId?.trim() || null;

      if (projectId) {
        await this.requireProjectInOrganization(
          projectId,
          note.organizationId,
        );

        data.project = {
          connect: {
            id: projectId,
          },
        };
      } else {
        data.project = {
          disconnect: true,
        };
      }

      nextProjectId = projectId;
    }

    if (body.taskId !== undefined) {
      const taskId = body.taskId?.trim() || null;

      if (taskId) {
        const task = await this.requireTaskInOrganization(
          taskId,
          note.organizationId,
        );
        this.validateProjectTaskLink(nextProjectId, task.projectId);

        data.task = {
          connect: {
            id: taskId,
          },
        };
      } else {
        data.task = {
          disconnect: true,
        };
      }

      nextTaskId = taskId;
    }

    if (nextTaskId && nextProjectId) {
      const task = await this.requireTaskInOrganization(
        nextTaskId,
        note.organizationId,
      );
      this.validateProjectTaskLink(nextProjectId, task.projectId);
    }

    return this.prisma.note.update({
      where: {
        id: noteId,
      },
      data,
      include: this.noteInclude(),
    });
  }

  async deleteNote(noteId: string, userId: string) {
    await this.getAccessibleNote(noteId, userId);

    const deletedNote = await this.prisma.note.delete({
      where: {
        id: noteId,
      },
      select: {
        id: true,
      },
    });

    return deletedNote;
  }

  async getTaskNotes(userId: string, taskId: string) {
    return this.getNotes(userId, {
      taskId,
    });
  }

  async markTaskNotesSeen(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.requireMembership(userId, task.project.organizationId);

    const readState = await this.prisma.taskNoteReadState.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
      update: {
        lastSeenAt: new Date(),
      },
      create: {
        taskId,
        userId,
        lastSeenAt: new Date(),
      },
    });

    const payload = await this.buildTaskAwarenessPayload(taskId, userId);

    return {
      ...readState,
      unreadNoteCount: payload.unreadNoteCount,
      recentNoteActivityAt: payload.recentNoteActivityAt,
      recentActivityAt: payload.recentActivityAt,
    };
  }

  async getNoteLinks(noteId: string, userId: string) {
    await this.requireAccessibleNoteWithOrg(noteId, userId);

    return this.getConnectedNotes(noteId);
  }

  async addNoteLink(
    noteId: string,
    linkedNoteId: string,
    userId: string,
  ) {
    if (noteId === linkedNoteId) {
      throw new BadRequestException('Cannot link a note to itself');
    }

    const sourceNote = await this.requireAccessibleNoteWithOrg(noteId, userId);
    const targetNote = await this.requireAccessibleNoteWithOrg(
      linkedNoteId,
      userId,
    );

    if (sourceNote.organizationId !== targetNote.organizationId) {
      throw new BadRequestException(
        'Linked notes must belong to the same organization',
      );
    }

    const existingLink = await this.prisma.noteLink.findFirst({
      where: {
        OR: [
          {
            sourceNoteId: noteId,
            targetNoteId: linkedNoteId,
          },
          {
            sourceNoteId: linkedNoteId,
            targetNoteId: noteId,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!existingLink) {
      await this.prisma.noteLink.create({
        data: {
          sourceNoteId: noteId,
          targetNoteId: linkedNoteId,
        },
      });
    }

    const [sourceState, targetState] = await Promise.all([
      this.getLinkedStateForNote(noteId),
      this.getLinkedStateForNote(linkedNoteId),
    ]);

    return {
      linkedNote: targetState,
      sourceNote: sourceState,
    };
  }

  async removeNoteLink(
    noteId: string,
    linkedNoteId: string,
    userId: string,
  ) {
    await this.requireAccessibleNoteWithOrg(noteId, userId);
    await this.requireAccessibleNoteWithOrg(linkedNoteId, userId);

    await this.prisma.noteLink.deleteMany({
      where: {
        OR: [
          {
            sourceNoteId: noteId,
            targetNoteId: linkedNoteId,
          },
          {
            sourceNoteId: linkedNoteId,
            targetNoteId: noteId,
          },
        ],
      },
    });

    const [sourceState, targetState] = await Promise.all([
      this.getLinkedStateForNote(noteId),
      this.getLinkedStateForNote(linkedNoteId),
    ]);

    return {
      removed: true,
      sourceNote: sourceState,
      linkedNote: targetState,
    };
  }
}
