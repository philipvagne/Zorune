import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getNotes(
    @Req() req: any,
    @Query('organizationId') organizationId?: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @Query('kind') kind?: string,
    @Query('q') q?: string,
  ) {
    return this.notesService.getNotes(req.user.sub, {
      organizationId,
      projectId,
      taskId,
      kind,
      q,
    });
  }

  @Post()
  createNote(@Req() req: any, @Body() body: CreateNoteDto) {
    return this.notesService.createNote(req.user.sub, body);
  }

  @Get(':noteId')
  getNote(@Req() req: any, @Param('noteId') noteId: string) {
    return this.notesService.getNote(noteId, req.user.sub);
  }

  @Patch(':noteId')
  updateNote(
    @Req() req: any,
    @Param('noteId') noteId: string,
    @Body() body: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(noteId, req.user.sub, body);
  }

  @Delete(':noteId')
  deleteNote(@Req() req: any, @Param('noteId') noteId: string) {
    return this.notesService.deleteNote(noteId, req.user.sub);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':taskId/notes')
  getTaskNotes(@Req() req: any, @Param('taskId') taskId: string) {
    return this.notesService.getTaskNotes(req.user.sub, taskId);
  }
}
