import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GameStatus as PrismaGameStatus, Prisma } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../common/prisma.service';
import { UsersService } from '../users/users.service';
import { BotService } from './bot.service';
import { Board, assertBoard, checkWinner, createInitialBoard, winnerToGameStatus } from './game.types';
import { ScoreService } from './score.service';
import { StartGameDto } from './start-game.dto';
import { GameResult } from './submit-game-result.dto';
import { SubmitMoveDto } from './submit-move.dto';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly scoreService: ScoreService,
    private readonly botService: BotService,
  ) {}

  async startGame(authUser: AuthUser, dto: StartGameDto = {}) {
    const user = await this.usersService.getOrCreateFromAuthUser(authUser);

    if (dto.forceNew) {
      await this.prisma.gameSession.updateMany({
        where: { userId: user.id, status: PrismaGameStatus.IN_PROGRESS },
        data: { status: PrismaGameStatus.ABANDONED },
      });
    } else {
      const activeGame = await this.prisma.gameSession.findFirst({
        where: { userId: user.id, status: PrismaGameStatus.IN_PROGRESS },
        orderBy: { createdAt: 'desc' },
      });
      if (activeGame) return this.toGameResponse(activeGame);
    }

    const game = await this.prisma.gameSession.create({
      data: {
        userId: user.id,
        board: createInitialBoard(),
        status: PrismaGameStatus.IN_PROGRESS,
      },
    });

    return this.toGameResponse(game);
  }

  async submitMove(authUser: AuthUser, gameId: string, dto: SubmitMoveDto) {
    const user = await this.usersService.getOrCreateFromAuthUser(authUser);

    return this.prisma.$transaction(async (tx) => {
      const game = await tx.gameSession.findFirst({
        where: { id: gameId, userId: user.id },
      });

      if (!game) throw new NotFoundException('Game not found');
      if (game.status !== PrismaGameStatus.IN_PROGRESS) {
        throw new BadRequestException('Game already finished');
      }

      const board = game.board;
      assertBoard(board);

      if (board[dto.row][dto.col] !== null) {
        throw new BadRequestException('Cell is already occupied');
      }

      board[dto.row][dto.col] = 'X';
      let status = winnerToGameStatus(checkWinner(board));

      if (!status) {
        const botMove = this.botService.getMove(board);
        if (botMove) {
          board[botMove.row][botMove.col] = 'O';
        }
        status = winnerToGameStatus(checkWinner(board));
      }

      const nextStatus = status ?? PrismaGameStatus.IN_PROGRESS;
      const updateResult = await tx.gameSession.updateMany({
        where: {
          id: game.id,
          status: PrismaGameStatus.IN_PROGRESS,
          updatedAt: game.updatedAt,
        },
        data: {
          board: board as Prisma.InputJsonValue,
          status: nextStatus,
          scoredAt: nextStatus === PrismaGameStatus.IN_PROGRESS ? null : new Date(),
        },
      });

      if (updateResult.count !== 1) {
        throw new BadRequestException('Game state changed. Please refresh and try again.');
      }

      const updatedGame = await tx.gameSession.findUniqueOrThrow({ where: { id: game.id } });
      const scoring = nextStatus === PrismaGameStatus.IN_PROGRESS ? null : await this.applyScore(tx, user.id, board, nextStatus);

      return {
        ...this.toGameResponse(updatedGame),
        scoring,
      };
    });
  }

  private async applyScore(
    tx: Prisma.TransactionClient,
    userId: string,
    board: Board,
    status: Exclude<PrismaGameStatus, 'IN_PROGRESS' | 'ABANDONED'>,
  ) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const result = this.statusToResult(status);
    const calculated = this.scoreService.calculateScore({
      currentScore: user.score,
      consecutiveWins: user.consecutiveWins,
      result,
    });
    const stats = this.getStatIncrement(result);

    const updatedUser = await tx.user.update({
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
        result,
        scoreChange: calculated.scoreChange,
        bonusScore: calculated.bonusScore,
        boardSnapshot: board as Prisma.InputJsonValue,
      },
    });

    return {
      result,
      scoreChange: calculated.scoreChange,
      bonusScore: calculated.bonusScore,
      currentScore: updatedUser.score,
      consecutiveWins: updatedUser.consecutiveWins,
      message: calculated.message,
    };
  }

  private toGameResponse(game: { id: string; board: Prisma.JsonValue; status: PrismaGameStatus }) {
    const board = game.board;
    assertBoard(board);
    return {
      id: game.id,
      board,
      status: this.toFrontendStatus(game.status),
    };
  }

  private toFrontendStatus(status: PrismaGameStatus) {
    if (status === PrismaGameStatus.WIN) return 'PLAYER_WIN';
    if (status === PrismaGameStatus.LOSE) return 'BOT_WIN';
    return status;
  }

  private statusToResult(status: Exclude<PrismaGameStatus, 'IN_PROGRESS' | 'ABANDONED'>): GameResult {
    if (status === PrismaGameStatus.WIN) return GameResult.WIN;
    if (status === PrismaGameStatus.LOSE) return GameResult.LOSE;
    return GameResult.DRAW;
  }

  private getStatIncrement(result: GameResult) {
    return {
      wins: result === GameResult.WIN ? 1 : 0,
      losses: result === GameResult.LOSE ? 1 : 0,
      draws: result === GameResult.DRAW ? 1 : 0,
    };
  }
}

export { checkWinner } from './game.types';
