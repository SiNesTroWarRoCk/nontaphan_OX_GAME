import { Injectable } from '@nestjs/common';
import { Board, Cell, checkWinner } from './game.types';

export type Move = { row: number; col: number };

@Injectable()
export class BotService {
  private readonly botSymbol: Cell = 'O';
  private readonly playerSymbol: Cell = 'X';

  getMove(board: Board): Move | null {
    const available = this.getAvailableMoves(board);
    if (available.length === 0) return null;

    let bestMove: Move | null = null;
    let bestScore = -Infinity;

    for (const move of available) {
      board[move.row][move.col] = this.botSymbol;
      const score = this.minimax(board, 0, false, -Infinity, Infinity);
      board[move.row][move.col] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(board: Board, depth: number, isBotTurn: boolean, alpha: number, beta: number): number {
    const winner = checkWinner(board);
    if (winner === this.botSymbol) return 10 - depth;
    if (winner === this.playerSymbol) return depth - 10;
    if (winner === 'DRAW') return 0;

    if (isBotTurn) {
      let bestScore = -Infinity;
      for (const move of this.getAvailableMoves(board)) {
        board[move.row][move.col] = this.botSymbol;
        bestScore = Math.max(bestScore, this.minimax(board, depth + 1, false, alpha, beta));
        board[move.row][move.col] = null;
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return bestScore;
    }

    let bestScore = Infinity;
    for (const move of this.getAvailableMoves(board)) {
      board[move.row][move.col] = this.playerSymbol;
      bestScore = Math.min(bestScore, this.minimax(board, depth + 1, true, alpha, beta));
      board[move.row][move.col] = null;
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return bestScore;
  }

  private getAvailableMoves(board: Board): Move[] {
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
}
