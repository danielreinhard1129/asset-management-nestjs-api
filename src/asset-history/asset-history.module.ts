import { Module } from '@nestjs/common';
import { PaginationModule } from 'src/pagination/pagination.module';
import { AssetHistoryController } from './asset-history.controller';
import { AssetHistoryService } from './asset-history.service';

@Module({
  imports: [PaginationModule],
  controllers: [AssetHistoryController],
  providers: [AssetHistoryService],
})
export class AssetHistoryModule {}
