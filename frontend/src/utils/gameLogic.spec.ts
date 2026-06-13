import { describe, expect, it } from 'vitest';
import type { Board } from '../types/game';
import { checkWinner, statusToBackendResult } from './gameLogic';

describe('checkWinner', () => {
  it('detects row win', () => {
    const board: Board = [['X', 'X', 'X'], [null, 'O', null], ['O', null, null]];
    expect(checkWinner(board)).toBe('X');
  });

  it('detects column win', () => {
    const board: Board = [['O', 'X', null], ['O', 'X', null], ['O', null, 'X']];
    expect(checkWinner(board)).toBe('O');
  });

  it('detects diagonal win', () => {
    const board: Board = [['X', 'O', null], ['O', 'X', null], [null, null, 'X']];
    expect(checkWinner(board)).toBe('X');
  });

  it('detects draw', () => {
    const board: Board = [['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']];
    expect(checkWinner(board)).toBe('DRAW');
  });

  it('detects in-progress', () => {
    const board: Board = [['X', null, null], [null, 'O', null], [null, null, null]];
    expect(checkWinner(board)).toBeNull();
  });
});

describe('statusToBackendResult', () => {
  it('maps frontend game results to backend results', () => {
    expect(statusToBackendResult('PLAYER_WIN')).toBe('WIN');
    expect(statusToBackendResult('BOT_WIN')).toBe('LOSE');
    expect(statusToBackendResult('DRAW')).toBe('DRAW');
  });
});
