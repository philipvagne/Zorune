import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotesController, TaskNotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [NotesController, TaskNotesController],
  providers: [NotesService],
})
export class NotesModule {}
