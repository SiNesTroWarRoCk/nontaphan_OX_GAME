import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

export type ScoreboardRow = {
  rank: number;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  score: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  consecutiveWins: number;
  lastPlayedAt: Date | null;
};

@Injectable()
export class ScoreboardService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ScoreboardRow[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
    });

    return calculateRankedScoreboard(users);
  }
}

export function calculateRankedScoreboard(users: User[]): ScoreboardRow[] {
  return users.map((user, index) => ({
    rank: index + 1,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    score: user.score,
    totalGames: user.totalGames,
    totalWins: user.totalWins,
    totalLosses: user.totalLosses,
    totalDraws: user.totalDraws,
    consecutiveWins: user.consecutiveWins,
    lastPlayedAt: user.lastPlayedAt,
  }));
}
