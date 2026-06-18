import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from './auth.constants';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OrganizationAuthorizationService } from './organization-authorization.service';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    OrganizationAuthorizationService,
  ],
  exports: [JwtAuthGuard, OrganizationAuthorizationService],
})
export class AuthModule {}
