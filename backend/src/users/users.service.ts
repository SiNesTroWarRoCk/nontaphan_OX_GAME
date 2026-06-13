import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { AuthUser } from '../auth/auth.types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateFromAuthUser(authUser: AuthUser) {
    return this.prisma.user.upsert({
      where: {
        provider_providerUserId: {
          provider: authUser.provider,
          providerUserId: authUser.providerUserId,
        },
      },
      create: {
        provider: authUser.provider,
        providerUserId: authUser.providerUserId,
        email: authUser.email,
        displayName: authUser.displayName,
        avatarUrl: authUser.avatarUrl,
      },
      update: {
        email: authUser.email,
        displayName: authUser.displayName,
        avatarUrl: authUser.avatarUrl,
      },
    });
  }

  toMeResponse(user: Awaited<ReturnType<UsersService['getOrCreateFromAuthUser']>>) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      score: user.score,
      consecutiveWins: user.consecutiveWins,
      totalGames: user.totalGames,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      totalDraws: user.totalDraws,
    };
  }
}
