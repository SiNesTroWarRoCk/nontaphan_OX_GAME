import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, Validate } from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export enum GameResult {
  WIN = 'WIN',
  LOSE = 'LOSE',
  DRAW = 'DRAW',
}

@ValidatorConstraint({ name: 'isBoardSnapshot', async: false })
class IsBoardSnapshotConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (!Array.isArray(value) || value.length !== 3) {
      return false;
    }

    return value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 3 &&
        row.every((cell) => cell === 'X' || cell === 'O' || cell === null),
    );
  }

  defaultMessage() {
    return 'boardSnapshot must be a 3x3 array containing X, O, or null';
  }
}

export class SubmitGameResultDto {
  @ApiProperty({ enum: GameResult, example: GameResult.WIN })
  @IsEnum(GameResult)
  result!: GameResult;

  @ApiProperty({
    example: [
      ['X', 'O', 'X'],
      ['O', 'X', null],
      [null, 'O', 'X'],
    ],
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @Validate(IsBoardSnapshotConstraint)
  boardSnapshot!: Array<Array<'X' | 'O' | null>>;
}
