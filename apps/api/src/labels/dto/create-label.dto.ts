import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const LABEL_COLORS = [
  'neutral', 'amber', 'blue', 'pink', 'rose', 'emerald', 'violet',
] as const;

export class CreateLabelDto {
  @ApiProperty({ example: 'Research' })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name: string;

  @ApiPropertyOptional({ enum: LABEL_COLORS })
  @IsOptional()
  @IsIn(LABEL_COLORS as unknown as string[])
  color?: string;
}
