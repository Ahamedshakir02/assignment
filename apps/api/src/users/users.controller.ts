import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.users.findOne(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile — Settings > Profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(userId, dto);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Persist theme, color mode, view mode and column visibility' })
  updatePreferences(@CurrentUser('id') userId: string, @Body() dto: UpdatePreferencesDto) {
    return this.users.updatePreferences(userId, dto);
  }
}
