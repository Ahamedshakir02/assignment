import { IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeMode, Accent, ViewMode } from '@prisma/client';

// Theme mode, color mode, view mode and column visibility all have to survive
// a refresh, so they live on the user rather than only in the browser.
export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ThemeMode })
  @IsOptional()
  @IsEnum(ThemeMode)
  themeMode?: ThemeMode;

  @ApiPropertyOptional({ enum: Accent })
  @IsOptional()
  @IsEnum(Accent)
  accent?: Accent;

  @ApiPropertyOptional({ enum: ViewMode })
  @IsOptional()
  @IsEnum(ViewMode)
  viewMode?: ViewMode;

  @ApiPropertyOptional({
    example: { priority: true, members: true, dueDate: true, labels: false },
    description: 'Column visibility from the Fields dropdown',
  })
  @IsOptional()
  @IsObject()
  visibleFields?: Record<string, boolean>;
}
