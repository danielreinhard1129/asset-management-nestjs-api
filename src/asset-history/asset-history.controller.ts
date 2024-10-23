import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetAssetHistoriesDTO } from 'src/asset/dto/get-asset-histories.dto';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { AssetHistoryService } from './asset-history.service';

@Controller('asset-histories')
export class AssetHistoryController {
  constructor(private readonly assetHistoryService: AssetHistoryService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'HR')
  @Get('/')
  async getAssetHistories(@Query() query: GetAssetHistoriesDTO) {
    return this.assetHistoryService.getAssetHistories(query);
  }
}
