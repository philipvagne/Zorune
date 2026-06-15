import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { getJwtSecret } from '../auth/auth.constants';

@Module({
  imports: [
    JwtModule.register({
      secret: getJwtSecret(),
    }),
  ],
  providers: [NotificationsGateway, PrismaService],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
