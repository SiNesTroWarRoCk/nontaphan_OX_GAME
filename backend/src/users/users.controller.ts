import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('bearer')
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile and score' })
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.getOrCreateFromAuthUser(request.user!);
    return this.usersService.toMeResponse(user);
  }
}
