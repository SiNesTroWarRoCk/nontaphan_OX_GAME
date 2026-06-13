import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ScoreboardService } from './scoreboard.service';

@ApiTags('scoreboard')
@ApiBearerAuth('bearer')
@Controller('scoreboard')
@UseGuards(AuthGuard)
export class ScoreboardController {
  constructor(private readonly scoreboardService: ScoreboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get ranked scoreboard' })
  list() {
    return this.scoreboardService.list();
  }
}
