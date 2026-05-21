import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.constants';
import { PrismaService } from '../prisma/prisma.service';

type PresenceUser = {
  id: string;
  fullName: string | null;
  username: string | null;
  email: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<
    string,
    {
      profile: PresenceUser;
      orgIds: Set<string>;
      socketIds: Set<string>;
    }
  >();

  private socketUsers = new Map<string, string>();
  private socketTaskViews = new Map<string, Set<string>>();
  private taskViewers = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

async handleConnection(client: Socket) {
  try {
    const token = client.handshake.auth?.token;

    if (!token) {
      console.log('No token provided');
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verify(token, {
      secret: jwtConstants.secret,
    });

    const userId = payload.sub;
    const profile = await this.getPresenceProfile(userId);

    if (!profile) {
      client.disconnect();
      return;
    }

    client.join(userId);
    client.data.userId = userId;

    this.socketUsers.set(client.id, userId);

    const existing = this.connectedUsers.get(userId);

    if (existing) {
      existing.socketIds.add(client.id);
    } else {
      this.connectedUsers.set(userId, {
        profile: profile.profile,
        orgIds: profile.orgIds,
        socketIds: new Set([client.id]),
      });
    }

    console.log('SOCKET AUTH SUCCESS:', userId);
    await this.emitOnlineUsers();
  } catch (err) {
    console.log('SOCKET AUTH FAILED:', err.message);
    client.disconnect();
  }
}

async handleDisconnect(client: Socket) {
  const userId = this.socketUsers.get(client.id);
  const viewedTaskIds = this.socketTaskViews.get(client.id) || new Set();

  if (userId) {
    const connectedUser = this.connectedUsers.get(userId);

    connectedUser?.socketIds.delete(client.id);

    if (connectedUser && connectedUser.socketIds.size === 0) {
      this.connectedUsers.delete(userId);
    }
  }

  this.socketUsers.delete(client.id);
  this.socketTaskViews.delete(client.id);

  for (const taskId of viewedTaskIds) {
    await this.removeTaskViewer(client.id, taskId);
  }

  await this.emitOnlineUsers();
}

sendNotification(userId: string, payload: any) {
  console.log('EMITTING NOTIFICATION:', {
    userId,
    payload,
  });

  this.server.to(userId).emit('notification', payload);
}

emitTaskUpdated(userIds: string[], payload: any) {
  const uniqueUserIds = [...new Set(userIds)];
  console.log("task_updated EMIT:", payload);
  for (const userId of uniqueUserIds) {
    this.server.to(userId).emit("task_updated", payload);
  }
}

emitTaskUpdateCreated(userIds: string[], payload: any) {
  const uniqueUserIds = [...new Set(userIds)];

  for (const userId of uniqueUserIds) {
    this.server.to(userId).emit("task_update_created", payload);
  }
}

@SubscribeMessage('task_viewing_join')
async handleTaskViewingJoin(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { taskId?: string },
) {
  const taskId = body?.taskId;
  const userId = this.socketUsers.get(client.id);

  if (!taskId || !userId) {
    return;
  }

  const authorizedUserIds = await this.getTaskAuthorizedUserIds(taskId);

  if (!authorizedUserIds.includes(userId)) {
    return;
  }

  if (!this.taskViewers.has(taskId)) {
    this.taskViewers.set(taskId, new Set());
  }

  if (!this.socketTaskViews.has(client.id)) {
    this.socketTaskViews.set(client.id, new Set());
  }

  this.taskViewers.get(taskId)?.add(userId);
  this.socketTaskViews.get(client.id)?.add(taskId);

  this.server.to(userId).emit('task_viewing_join', { taskId });
  await this.emitTaskViewers(taskId);
}

@SubscribeMessage('task_viewing_leave')
async handleTaskViewingLeave(
  @ConnectedSocket() client: Socket,
  @MessageBody() body: { taskId?: string },
) {
  const taskId = body?.taskId;

  if (!taskId) {
    return;
  }

  this.server
    .to(this.socketUsers.get(client.id) || client.id)
    .emit('task_viewing_leave', { taskId });
  await this.removeTaskViewer(client.id, taskId);
}

private async getPresenceProfile(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      memberships: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    profile: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
    },
    orgIds: new Set(
      user.memberships.map((membership) => membership.organizationId),
    ),
  };
}

private getVisibleOnlineUsers(userId: string) {
  const currentUser = this.connectedUsers.get(userId);

  if (!currentUser) {
    return [];
  }

  return [...this.connectedUsers.values()]
    .filter((connectedUser) => {
      if (connectedUser.profile.id === userId) {
        return true;
      }

      return [...connectedUser.orgIds].some((orgId) =>
        currentUser.orgIds.has(orgId),
      );
    })
    .map((connectedUser) => connectedUser.profile);
}

private async emitOnlineUsers() {
  for (const userId of this.connectedUsers.keys()) {
    this.server.to(userId).emit('presence_online_users', {
      users: this.getVisibleOnlineUsers(userId),
    });
  }
}

private async getTaskAuthorizedUserIds(taskId: string) {
  const task = await this.prisma.task.findUnique({
    where: { id: taskId },
    select: {
      project: {
        select: {
          organizationId: true,
          organization: {
            select: {
              memberships: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!task) {
    return [];
  }

  return task.project.organization.memberships.map(
    (membership) => membership.userId,
  );
}

private async removeTaskViewer(socketId: string, taskId: string) {
  const userId = this.socketUsers.get(socketId);

  if (!userId) {
    return;
  }

  const socketTaskIds = this.socketTaskViews.get(socketId);
  socketTaskIds?.delete(taskId);

  const userStillViewingTask = [...this.socketTaskViews.entries()].some(
    ([otherSocketId, taskIds]) =>
      otherSocketId !== socketId &&
      this.socketUsers.get(otherSocketId) === userId &&
      taskIds.has(taskId),
  );

  if (!userStillViewingTask) {
    this.taskViewers.get(taskId)?.delete(userId);
  }

  if (this.taskViewers.get(taskId)?.size === 0) {
    this.taskViewers.delete(taskId);
  }

  await this.emitTaskViewers(taskId);
}

private async emitTaskViewers(taskId: string) {
  const authorizedUserIds = await this.getTaskAuthorizedUserIds(taskId);
  const viewerIds = this.taskViewers.get(taskId) || new Set<string>();
  const viewers = [...viewerIds]
    .map((viewerId) => this.connectedUsers.get(viewerId)?.profile)
    .filter(Boolean);

  for (const userId of authorizedUserIds) {
    this.server.to(userId).emit('task_viewers_updated', {
      taskId,
      viewers,
    });
  }
}
}
