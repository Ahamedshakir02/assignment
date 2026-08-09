import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('labels')
@Controller('labels')
export class LabelsController {
  constructor(private readonly labels: LabelsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.labels.findAll(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateLabelDto) {
    return this.labels.create(userId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.labels.remove(userId, id);
  }
}
