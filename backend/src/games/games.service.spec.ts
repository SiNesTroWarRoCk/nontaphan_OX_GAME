import { checkWinner } from './games.service';

describe('backend checkWinner', () => {
  it('detects X winner', () => {
    expect(checkWinner([['X', 'X', 'X'], ['O', null, null], ['O', null, null]])).toBe('X');
  });

  it('detects draw', () => {
    expect(checkWinner([['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']])).toBe('DRAW');
  });
});
