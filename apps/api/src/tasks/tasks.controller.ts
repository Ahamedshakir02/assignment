import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks (flat)' })
  findAll(@CurrentUser('id') userId: string, @Query() query: QueryTasksDto) {
    return this.tasks.findAll(userId, query);
  }

  @Get('grouped')
  @ApiOperation({ summary: 'List tasks grouped by status — powers list and board views' })
  findGrouped(@CurrentUser('id') userId: string, @Query() query: QueryTasksDto) {
    return this.tasks.findGrouped(userId, query);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Bulk reorder / move between columns' })
  reorder(@CurrentUser('id') userId: string, @Body() dto: ReorderTasksDto) {
    return this.tasks.reorder(userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tasks.findOne(userId, id);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tasks.remove(userId, id);
  }
}
