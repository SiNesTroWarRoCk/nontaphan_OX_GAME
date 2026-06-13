import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { UsersService } from './users.service';

@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.getOrCreateFromAuthUser(request.user!);
    return this.usersService.toMeResponse(user);
  }
}
