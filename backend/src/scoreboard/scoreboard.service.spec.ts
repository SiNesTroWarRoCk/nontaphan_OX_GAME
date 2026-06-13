import type { User } from '@prisma/client';
import { calculateRankedScoreboard } from './scoreboard.service';

function makeUser(id: string, score: number): User {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id,
    provider: 'auth0',
    providerUserId: `auth0|${id}`,
    email: `${id}@example.com`,
    displayName: id,
    avatarUrl: null,
    score,
    consecutiveWins: 0,
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    lastPlayedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

describe('calculateRankedScoreboard', () => {
  it('calculates rank from sorted users', () => {
    const rows = calculateRankedScoreboard([makeUser('a', 20), makeUser('b', 10)]);
    expect(rows.map((row) => row.rank)).toEqual([1, 2]);
    expect(rows.map((row) => row.score)).toEqual([20, 10]);
  });
});
