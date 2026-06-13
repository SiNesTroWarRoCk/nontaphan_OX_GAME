import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { UsersService } from '../users/users.service';
import { ScoreService } from './score.service';
import { GameResult, SubmitGameResultDto } from './submit-game-result.dto';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly scoreService: ScoreService,
  ) {}

  async applyGameResult(authUser: AuthUser, dto: SubmitGameResultDto) {
    this.validateSubmittedResult(dto);

    const user = await this.usersService.getOrCreateFromAuthUser(authUser);
    const calculated = this.scoreService.calculateScore({
      currentScore: user.score,
      consecutiveWins: user.consecutiveWins,
      result: dto.result,
    });

    const stats = this.getStatIncrement(dto.result);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const nextUser = await tx.user.update({
        where: { id: user.id },
        data: {
          score: calculated.nextScore,
          consecutiveWins: calculated.nextConsecutiveWins,
          totalGames: { increment: 1 },
          totalWins: { increment: stats.wins },
          totalLosses: { increment: stats.losses },
          totalDraws: { increment: stats.draws },
          lastPlayedAt: new Date(),
        },
      });

      await tx.gameHistory.create({
        data: {
          userId: user.id,
          result: dto.result,
          scoreChange: calculated.scoreChange,
          bonusScore: calculated.bonusScore,
          boardSnapshot: dto.boardSnapshot,
        },
      });

      return nextUser;
    });

    return {
      result: dto.result,
      scoreChange: calculated.scoreChange,
      bonusScore: calculated.bonusScore,
      currentScore: updatedUser.score,
      consecutiveWins: updatedUser.consecutiveWins,
      message: calculated.message,
    };
  }

  private getStatIncrement(result: GameResult) {
    return {
      wins: result === GameResult.WIN ? 1 : 0,
      losses: result === GameResult.LOSE ? 1 : 0,
      draws: result === GameResult.DRAW ? 1 : 0,
    };
  }

  private validateSubmittedResult(dto: SubmitGameResultDto) {
    const winner = checkWinner(dto.boardSnapshot);
    const expectedResult = winner === 'X' ? GameResult.WIN : winner === 'O' ? GameResult.LOSE : winner === 'DRAW' ? GameResult.DRAW : null;

    if (!expectedResult) {
      throw new BadRequestException('Cannot submit an unfinished game');
    }

    if (expectedResult !== dto.result) {
      throw new BadRequestException('Submitted result does not match board snapshot');
    }
  }
}

type Cell = 'X' | 'O' | null;
type Winner = 'X' | 'O' | 'DRAW' | null;

export function checkWinner(board: Cell[][]): Winner {
  const lines = [
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];

  for (const line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      return line[0];
    }
  }

  return board.every((row) => row.every((cell) => cell !== null)) ? 'DRAW' : null;
}
