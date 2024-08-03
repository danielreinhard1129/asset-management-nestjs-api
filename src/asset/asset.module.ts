import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

@Module({
  imports: [PaginationModule, CloudinaryModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
