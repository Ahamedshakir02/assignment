import { IsOptional, IsString, MaxLength, Matches, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Mirrors the Settings > Profile card in the design.
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Dexter' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Designer', description: 'Your job title or role' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @ApiPropertyOptional({
    example: 'dexuser',
    description: 'One word, like a nickname or first name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username must be one word — letters, numbers, hyphens or underscores only',
  })
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
