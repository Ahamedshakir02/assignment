import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get('tasks/:taskId/comments')
  findAll(@CurrentUser('id') userId: string, @Param('taskId') taskId: string) {
    return this.comments.findAll(userId, taskId);
  }

  @Post('tasks/:taskId/comments')
  create(
    @CurrentUser('id') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(userId, taskId, dto);
  }

  @Delete('comments/:id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.comments.remove(userId, id);
  }
}
