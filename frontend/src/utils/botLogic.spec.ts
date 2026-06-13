import { describe, expect, it } from 'vitest';
import type { Board } from '../types/game';
import { getBotMove } from './botLogic';

describe('getBotMove', () => {
  it('wins when possible', () => {
    const board: Board = [['O', 'O', null], ['X', 'X', null], [null, null, null]];
    expect(getBotMove(board)).toEqual({ row: 0, col: 2 });
  });

  it('blocks player winning move', () => {
    const board: Board = [['X', 'X', null], ['O', null, null], [null, null, null]];
    expect(getBotMove(board)).toEqual({ row: 0, col: 2 });
  });

  it('takes center if available', () => {
    const board: Board = [['X', null, null], [null, null, null], [null, null, null]];
    expect(getBotMove(board)).toEqual({ row: 1, col: 1 });
  });

  it('returns null when board is full', () => {
    const board: Board = [['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']];
    expect(getBotMove(board)).toBeNull();
  });
});
