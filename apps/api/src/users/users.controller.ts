import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.usersService.me(req.user.sub);
  }

  @Get('search')
  search(@Req() req: any, @Query('q') query = '') {
    return this.usersService.search(req.user.sub, query);
  }
}
