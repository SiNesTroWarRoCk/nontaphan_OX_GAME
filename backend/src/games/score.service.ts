import { Injectable } from '@nestjs/common';
import { GameResult } from './submit-game-result.dto';

export type CalculateScoreInput = {
  currentScore: number;
  consecutiveWins: number;
  result: GameResult;
};

export type CalculateScoreOutput = {
  scoreChange: number;
  bonusScore: number;
  nextScore: number;
  nextConsecutiveWins: number;
  message: string;
};

@Injectable()
export class ScoreService {
  calculateScore(input: CalculateScoreInput): CalculateScoreOutput {
    let scoreChange = 0;
    let bonusScore = 0;
    let nextConsecutiveWins = input.consecutiveWins;
    let message = 'Draw. Score unchanged.';

    if (input.result === GameResult.WIN) {
      scoreChange = 1;
      nextConsecutiveWins += 1;
      message = 'You win! +1 point';

      if (nextConsecutiveWins === 3) {
        bonusScore = 1;
        nextConsecutiveWins = 0;
        message = 'You win 3 times in a row! Bonus +1 point';
      }
    }

    if (input.result === GameResult.LOSE) {
      scoreChange = -1;
      nextConsecutiveWins = 0;
      message = 'You lose. -1 point';
    }

    if (input.result === GameResult.DRAW) {
      scoreChange = 0;
      nextConsecutiveWins = 0;
    }

    return {
      scoreChange,
      bonusScore,
      nextScore: input.currentScore + scoreChange + bonusScore,
      nextConsecutiveWins,
      message,
    };
  }
}
