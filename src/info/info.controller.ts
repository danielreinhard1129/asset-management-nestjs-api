import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { InfoService } from './info.service';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'HR')
  @Get('/resources')
  async getAssets() {
    return this.infoService.getTotalResources();
  }

  @Get('/asset-by-status')
  async getTotalAssetByStatus() {
    return this.infoService.getTotalAssetByStatus();
  }
}
