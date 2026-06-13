import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { ScoreService } from './score.service';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [GamesController],
  providers: [GamesService, ScoreService, BotService],
})
export class GamesModule {}
