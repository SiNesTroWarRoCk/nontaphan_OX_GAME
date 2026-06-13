import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class SubmitMoveDto {
  @ApiProperty({ minimum: 0, maximum: 2 })
  @IsInt()
  @Min(0)
  @Max(2)
  row!: number;

  @ApiProperty({ minimum: 0, maximum: 2 })
  @IsInt()
  @Min(0)
  @Max(2)
  col!: number;
}
