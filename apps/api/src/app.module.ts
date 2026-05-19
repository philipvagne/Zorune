import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [AuthModule, OrganizationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
