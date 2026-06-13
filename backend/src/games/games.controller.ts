import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { GamesService } from './games.service';
import { StartGameDto } from './start-game.dto';
import { SubmitMoveDto } from './submit-move.dto';

@ApiTags('games')
@ApiBearerAuth('bearer')
@Controller('games')
@UseGuards(AuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start or resume a backend-owned game session' })
  startGame(@Req() request: AuthenticatedRequest, @Body() body: StartGameDto) {
    return this.gamesService.startGame(request.user!, body);
  }

  @Post(':gameId/move')
  @ApiOperation({ summary: 'Submit a player move. Backend validates, moves bot, and scores when finished.' })
  submitMove(@Req() request: AuthenticatedRequest, @Param('gameId') gameId: string, @Body() body: SubmitMoveDto) {
    return this.gamesService.submitMove(request.user!, gameId, body);
  }
}
