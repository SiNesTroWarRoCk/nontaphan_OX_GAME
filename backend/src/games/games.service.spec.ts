import { BadRequestException } from '@nestjs/common';
import { GameStatus as PrismaGameStatus } from '@prisma/client';
import type { AuthUser } from '../auth/auth.types';
import { BotService } from './bot.service';
import { Board, checkWinner } from './game.types';
import { GamesService } from './games.service';
import { ScoreService } from './score.service';

const now = new Date('2026-01-01T00:00:00.000Z');
const authUser: AuthUser = {
  provider: 'google',
  providerUserId: 'google-user-1',
  email: 'player@example.com',
};

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    provider: 'google',
    providerUserId: 'google-user-1',
    email: 'player@example.com',
    displayName: 'Player',
    avatarUrl: null,
    score: 0,
    consecutiveWins: 0,
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    lastPlayedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeGame(board: Board, overrides: Record<string, unknown> = {}) {
  return {
    id: 'game-1',
    userId: 'user-1',
    board,
    status: PrismaGameStatus.IN_PROGRESS,
    scoredAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeService() {
  const user = makeUser();
  const usersService = {
    getOrCreateFromAuthUser: jest.fn().mockResolvedValue(user),
  };
  const tx = {
    gameSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    user: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...user,
          score: data.score,
          consecutiveWins: data.consecutiveWins,
          totalGames: user.totalGames + (data.totalGames?.increment ?? 0),
          totalWins: user.totalWins + (data.totalWins?.increment ?? 0),
          totalLosses: user.totalLosses + (data.totalLosses?.increment ?? 0),
          totalDraws: user.totalDraws + (data.totalDraws?.increment ?? 0),
        }),
      ),
    },
    gameHistory: {
      create: jest.fn(),
    },
  };
  const prisma = {
    gameSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback: (txArg: typeof tx) => unknown) => callback(tx)),
  };
  const service = new GamesService(
    prisma as never,
    usersService as never,
    new ScoreService(),
    new BotService(),
  );

  return { service, prisma, tx, usersService, user };
}

describe('backend checkWinner', () => {
  it('detects X winner', () => {
    expect(checkWinner([['X', 'X', 'X'], ['O', null, null], ['O', null, null]])).toBe('X');
  });

  it('detects draw', () => {
    expect(checkWinner([['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']])).toBe('DRAW');
  });
});

describe('GamesService', () => {
  it('starts a new backend-owned game when no active game exists', async () => {
    const { service, prisma } = makeService();
    prisma.gameSession.findFirst.mockResolvedValue(null);
    prisma.gameSession.create.mockResolvedValue(makeGame([[null, null, null], [null, null, null], [null, null, null]]));

    await expect(service.startGame(authUser)).resolves.toEqual({
      id: 'game-1',
      board: [[null, null, null], [null, null, null], [null, null, null]],
      status: 'IN_PROGRESS',
    });
    expect(prisma.gameSession.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        status: PrismaGameStatus.IN_PROGRESS,
      },
    });
  });

  it('resumes an existing in-progress game instead of creating a duplicate', async () => {
    const { service, prisma } = makeService();
    const activeGame = makeGame([['X', null, null], [null, 'O', null], [null, null, null]]);
    prisma.gameSession.findFirst.mockResolvedValue(activeGame);

    await expect(service.startGame(authUser)).resolves.toMatchObject({
      id: 'game-1',
      board: activeGame.board,
      status: 'IN_PROGRESS',
    });
    expect(prisma.gameSession.create).not.toHaveBeenCalled();
  });

  it('only accepts a move, then scores from server-owned board when player wins', async () => {
    const { service, tx } = makeService();
    const startingBoard: Board = [['X', 'X', null], ['O', null, null], ['O', null, null]];
    const finalBoard: Board = [['X', 'X', 'X'], ['O', null, null], ['O', null, null]];

    tx.gameSession.findFirst.mockResolvedValue(makeGame(startingBoard));
    tx.gameSession.updateMany.mockResolvedValue({ count: 1 });
    tx.gameSession.findUniqueOrThrow.mockResolvedValue(makeGame(finalBoard, {
      status: PrismaGameStatus.WIN,
      scoredAt: now,
    }));

    await expect(service.submitMove(authUser, 'game-1', { row: 0, col: 2 })).resolves.toEqual({
      id: 'game-1',
      board: finalBoard,
      status: 'PLAYER_WIN',
      scoring: {
        result: 'WIN',
        scoreChange: 1,
        bonusScore: 0,
        currentScore: 1,
        consecutiveWins: 1,
        message: 'You win! +1 point',
      },
    });
    expect(tx.gameHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        result: 'WIN',
        boardSnapshot: finalBoard,
      }),
    });
  });

  it('moves the bot on the backend when the player move does not finish the game', async () => {
    const { service, tx } = makeService();
    const startingBoard: Board = [[null, null, null], [null, null, null], [null, null, null]];
    const expectedBoard: Board = [['X', null, null], [null, 'O', null], [null, null, null]];

    tx.gameSession.findFirst.mockResolvedValue(makeGame(startingBoard));
    tx.gameSession.updateMany.mockResolvedValue({ count: 1 });
    tx.gameSession.findUniqueOrThrow.mockResolvedValue(makeGame(expectedBoard));

    await expect(service.submitMove(authUser, 'game-1', { row: 0, col: 0 })).resolves.toEqual({
      id: 'game-1',
      board: expectedBoard,
      status: 'IN_PROGRESS',
      scoring: null,
    });
    expect(tx.gameHistory.create).not.toHaveBeenCalled();
  });

  it('rejects an occupied cell and does not update score', async () => {
    const { service, tx } = makeService();
    tx.gameSession.findFirst.mockResolvedValue(makeGame([['X', null, null], [null, 'O', null], [null, null, null]]));

    await expect(service.submitMove(authUser, 'game-1', { row: 0, col: 0 })).rejects.toThrow(BadRequestException);
    expect(tx.gameSession.updateMany).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.gameHistory.create).not.toHaveBeenCalled();
  });

  it('prevents stale double submissions from scoring twice', async () => {
    const { service, tx } = makeService();
    tx.gameSession.findFirst.mockResolvedValue(makeGame([['X', 'X', null], ['O', null, null], ['O', null, null]]));
    tx.gameSession.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.submitMove(authUser, 'game-1', { row: 0, col: 2 })).rejects.toThrow(BadRequestException);
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.gameHistory.create).not.toHaveBeenCalled();
  });
});

describe('BotService', () => {
  const bot = new BotService();

  it('takes a winning move before blocking', () => {
    expect(bot.getMove([['O', 'O', null], ['X', 'X', null], [null, null, null]])).toEqual({ row: 0, col: 2 });
  });

  it('blocks an immediate player win', () => {
    expect(bot.getMove([['X', 'X', null], [null, 'O', null], [null, null, null]])).toEqual({ row: 0, col: 2 });
  });
});
