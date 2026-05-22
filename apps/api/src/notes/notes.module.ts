import { Module } from '@nestjs/common';
import { NotesController, TaskNotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  controllers: [NotesController, TaskNotesController],
  providers: [NotesService],
})
export class NotesModule {}
