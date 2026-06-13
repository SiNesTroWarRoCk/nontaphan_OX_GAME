import type { Request } from 'express';

export type AuthUser = {
  provider: string;
  providerUserId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
