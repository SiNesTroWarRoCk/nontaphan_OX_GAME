import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class StartGameDto {
  @ApiPropertyOptional({ description: 'Abandon current in-progress game and start a new one' })
  @IsOptional()
  @IsBoolean()
  forceNew?: boolean;
}
