import type { Board, GameResult, GameStatus, Winner } from '../types/game';

export const createInitialBoard = (): Board => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export const initialBoard: Board = createInitialBoard();

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function checkWinner(board: Board): Winner {
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

export function winnerToStatus(winner: Winner): GameStatus {
  if (winner === 'X') return 'PLAYER_WIN';
  if (winner === 'O') return 'BOT_WIN';
  if (winner === 'DRAW') return 'DRAW';
  return 'IN_PROGRESS';
}

export function statusToBackendResult(status: GameStatus): GameResult | null {
  if (status === 'PLAYER_WIN') return 'WIN';
  if (status === 'BOT_WIN') return 'LOSE';
  if (status === 'DRAW') return 'DRAW';
  return null;
}
