import { Module } from '@nestjs/common';
import { PaginationModule } from 'src/pagination/pagination.module';
import { AssetReturnController } from './asset-return.controller';
import { AssetReturnService } from './asset-return.service';
import { BastModule } from 'src/bast/bast.module';

@Module({
  imports: [PaginationModule, BastModule],
  controllers: [AssetReturnController],
  providers: [AssetReturnService],
})
export class AssetReturnModule {}
