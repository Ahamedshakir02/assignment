import { IsArray, IsString, IsInt, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '@prisma/client';

export class ReorderItemDto {
  @IsString()
  id: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsInt()
  order: number;
}

export class ReorderTasksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
