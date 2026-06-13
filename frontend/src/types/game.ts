export type Cell = 'X' | 'O' | null;
export type Board = Cell[][];
export type GameResult = 'WIN' | 'LOSE' | 'DRAW';
export type Winner = 'X' | 'O' | 'DRAW' | null;
export type GameStatus = 'IN_PROGRESS' | 'PLAYER_WIN' | 'BOT_WIN' | 'DRAW';
export type Move = { row: number; col: number };
