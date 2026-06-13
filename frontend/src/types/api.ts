export type Me = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  score: number;
  consecutiveWins: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
};

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
  lastPlayedAt?: string | null;
};

export type GameResultResponse = {
  result: 'WIN' | 'LOSE' | 'DRAW';
  scoreChange: number;
  bonusScore: number;
  currentScore: number;
  consecutiveWins: number;
  message: string;
};

export type GameSessionResponse = {
  id: string;
  board: Array<Array<'X' | 'O' | null>>;
  status: 'IN_PROGRESS' | 'PLAYER_WIN' | 'BOT_WIN' | 'DRAW' | 'ABANDONED';
};

export type MoveResponse = GameSessionResponse & {
  scoring: GameResultResponse | null;
};
