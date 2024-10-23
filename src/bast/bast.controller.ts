import { Controller, Get, Param } from '@nestjs/common';
import { BastService } from './bast.service';

@Controller('bast')
export class BastController {
  constructor(private readonly bastService: BastService) {}

  @Get('/:bastNo')
  async getAssetRequest(@Param('bastNo') bastNo: string) {
    return this.bastService.getBastByBastNo(bastNo);
  }
}
