import type { Board, Cell, Move } from '../types/game';
import { checkWinner, cloneBoard } from './gameLogic';

export function getAvailableMoves(board: Board): Move[] {
  const moves: Move[] = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === null) {
        moves.push({ row: rowIndex, col: colIndex });
      }
    });
  });
  return moves;
}

export function findWinningMove(board: Board, symbol: Cell): Move | null {
  if (!symbol) return null;

  for (const move of getAvailableMoves(board)) {
    const nextBoard = cloneBoard(board);
    nextBoard[move.row][move.col] = symbol;
    if (checkWinner(nextBoard) === symbol) {
      return move;
    }
  }

  return null;
}

export function getBotMove(board: Board): Move | null {
  const available = getAvailableMoves(board);
  if (available.length === 0) return null;

  const winningMove = findWinningMove(board, 'O');
  if (winningMove) return winningMove;

  const blockingMove = findWinningMove(board, 'X');
  if (blockingMove) return blockingMove;

  if (board[1][1] === null) return { row: 1, col: 1 };

  const corners = available.filter(
    (move) =>
      (move.row === 0 && move.col === 0) ||
      (move.row === 0 && move.col === 2) ||
      (move.row === 2 && move.col === 0) ||
      (move.row === 2 && move.col === 2),
  );
  if (corners.length > 0) return corners[0];

  return available[Math.floor(Math.random() * available.length)];
}
