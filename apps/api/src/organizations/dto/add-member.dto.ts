import { IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @IsOptional()
  @IsString()
  emailOrUsername?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
