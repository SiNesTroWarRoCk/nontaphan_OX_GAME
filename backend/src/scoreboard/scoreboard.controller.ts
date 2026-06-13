import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ScoreboardService } from './scoreboard.service';

@Controller('scoreboard')
@UseGuards(AuthGuard)
export class ScoreboardController {
  constructor(private readonly scoreboardService: ScoreboardService) {}

  @Get()
  list() {
    return this.scoreboardService.list();
  }
}
