import { Module } from '@nestjs/common';
import { BastModule } from 'src/bast/bast.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { AssetRequestController } from './asset-request.controller';
import { AssetRequestService } from './asset-request.service';

@Module({
  imports: [PaginationModule, BastModule],
  controllers: [AssetRequestController],
  providers: [AssetRequestService],
})
export class AssetRequestModule {}
