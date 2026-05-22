import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotesController, TaskNotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [NotificationsModule],
  controllers: [NotesController, TaskNotesController],
  providers: [NotesService],
})
export class NotesModule {}
