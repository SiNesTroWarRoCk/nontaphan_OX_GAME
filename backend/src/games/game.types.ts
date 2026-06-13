export type Cell = 'X' | 'O' | null;
export type Board = Cell[][];
export type Winner = 'X' | 'O' | 'DRAW' | null;
export type GameStatus = 'IN_PROGRESS' | 'WIN' | 'LOSE' | 'DRAW' | 'ABANDONED';

export const createInitialBoard = (): Board => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export function assertBoard(value: unknown): asserts value is Board {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    !value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 3 &&
        row.every((cell) => cell === 'X' || cell === 'O' || cell === null),
    )
  ) {
    throw new Error('Invalid board stored in database');
  }
}

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

export function winnerToGameStatus(winner: Winner): Exclude<GameStatus, 'IN_PROGRESS' | 'ABANDONED'> | null {
  if (winner === 'X') return 'WIN';
  if (winner === 'O') return 'LOSE';
  if (winner === 'DRAW') return 'DRAW';
  return null;
}
