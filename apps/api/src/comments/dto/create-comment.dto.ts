import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty' })
  @MaxLength(4000)
  body: string;

  @ApiPropertyOptional({ description: 'Set to reply to an existing comment' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
