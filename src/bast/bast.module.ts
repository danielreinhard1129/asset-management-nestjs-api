import { Module } from '@nestjs/common';
import { BastService } from './bast.service';
import { BastController } from './bast.controller';

@Module({
  controllers: [BastController],
  providers: [BastService],
  exports: [BastService],
})
export class BastModule {}
