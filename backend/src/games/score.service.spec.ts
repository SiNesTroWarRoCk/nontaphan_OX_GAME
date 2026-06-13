import { ScoreService } from './score.service';
import { GameResult } from './submit-game-result.dto';

describe('ScoreService', () => {
  const service = new ScoreService();

  it('WIN gives +1 and increments consecutive wins', () => {
    expect(service.calculateScore({ currentScore: 0, consecutiveWins: 0, result: GameResult.WIN })).toMatchObject({
      scoreChange: 1,
      bonusScore: 0,
      nextScore: 1,
      nextConsecutiveWins: 1,
    });
  });

  it('LOSE gives -1 and resets consecutive wins', () => {
    expect(service.calculateScore({ currentScore: 5, consecutiveWins: 2, result: GameResult.LOSE })).toMatchObject({
      scoreChange: -1,
      bonusScore: 0,
      nextScore: 4,
      nextConsecutiveWins: 0,
    });
  });

  it('DRAW gives 0 and resets consecutive wins', () => {
    expect(service.calculateScore({ currentScore: 5, consecutiveWins: 2, result: GameResult.DRAW })).toMatchObject({
      scoreChange: 0,
      bonusScore: 0,
      nextScore: 5,
      nextConsecutiveWins: 0,
    });
  });

  it('third consecutive WIN gives bonus +1 and resets consecutive wins', () => {
    expect(service.calculateScore({ currentScore: 2, consecutiveWins: 2, result: GameResult.WIN })).toMatchObject({
      scoreChange: 1,
      bonusScore: 1,
      nextScore: 4,
      nextConsecutiveWins: 0,
    });
  });
});
