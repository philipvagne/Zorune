import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

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
    } as const;
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

  async getNotes(
    userId: string,
    filters: {
      organizationId?: string;
      projectId?: string;
      taskId?: string;
      q?: string;
    },
  ) {
    const where: Prisma.NoteWhereInput = {};
    const organizationId = filters.organizationId?.trim();
    const projectId = filters.projectId?.trim();
    const taskId = filters.taskId?.trim();
    const q = filters.q?.trim();

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
      ];
    }

    return this.prisma.note.findMany({
      where,
      include: this.noteInclude(),
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async createNote(userId: string, body: CreateNoteDto) {
    const title = body.title?.trim();
    const organizationId = body.organizationId?.trim();
    const projectId = body.projectId?.trim() || null;
    const taskId = body.taskId?.trim() || null;

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

    if (taskId) {
      const task = await this.requireTaskInOrganization(
        taskId,
        organizationId,
      );
      this.validateProjectTaskLink(projectId, task.projectId);
    }

    return this.prisma.note.create({
      data: {
        title,
        content: body.content ?? '',
        organizationId,
        projectId,
        taskId,
        createdById: userId,
      },
      include: this.noteInclude(),
    });
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
}
