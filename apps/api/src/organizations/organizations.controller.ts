import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':orgId')
  getOrganization(
    @Param('orgId') orgId: string,
    @Req() req: any,
  ) {
    return this.organizationsService.getOrganization(
      orgId,
      req.user.sub,
    );
  }
}