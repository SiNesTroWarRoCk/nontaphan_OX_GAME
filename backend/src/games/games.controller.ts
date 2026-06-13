import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { GamesService } from './games.service';
import { SubmitGameResultDto } from './submit-game-result.dto';

@ApiTags('games')
@ApiBearerAuth('bearer')
@Controller('games')
@UseGuards(AuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('result')
  @ApiOperation({ summary: 'Submit completed game result and update backend-owned score' })
  submitResult(@Req() request: AuthenticatedRequest, @Body() body: SubmitGameResultDto) {
    return this.gamesService.applyGameResult(request.user!, body);
  }
}
