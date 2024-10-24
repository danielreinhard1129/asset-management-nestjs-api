import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AssetReturnService } from './asset-return.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { User } from 'src/auth/decorator/user.decorator';
import { PayloadToken } from 'src/auth/types';
import { GetAssetReturnedDTO } from './dto/get-asset-returned.dto';
import { CreateAssetReturnDTO } from './dto/create-asset-return.dto';

@Controller('asset-returned')
export class AssetReturnController {
  constructor(private readonly assetReturnService: AssetReturnService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'HR')
  @Get('/')
  async getAssetReturned(
    @User() user: PayloadToken,
    @Query() query: GetAssetReturnedDTO,
  ) {
    return this.assetReturnService.getAssetReturned(query, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'HR')
  @Get('/:id')
  async getAssetReturn(@Param('id') id: number) {
    return this.assetReturnService.getAssetReturn(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER')
  @Post('/')
  async createAssetReturned(
    @User() user: PayloadToken,
    @Body() dto: CreateAssetReturnDTO,
  ) {
    return this.assetReturnService.createAssetReturned(dto, Number(user.id));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('HR')
  @Patch('/:id/approve')
  async approveAssetReturn(
    @User() user: PayloadToken,
    @Param('id') id: number,
  ) {
    return await this.assetReturnService.approveAssetReturn(
      id,
      Number(user.id),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('/:id/done')
  async doneAssetReturn(@User() user: PayloadToken, @Param('id') id: number) {
    return await this.assetReturnService.doneAssetReturn(id, Number(user.id));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  @Patch('/:id/reject')
  async rejectAssetReturn(@User() user: PayloadToken, @Param('id') id: number) {
    return await this.assetReturnService.rejectAssetReturn(id);
  }
}
