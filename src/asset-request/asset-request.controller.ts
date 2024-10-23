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
import { Roles } from 'src/auth/decorator/role.decorator';
import { User } from 'src/auth/decorator/user.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { PayloadToken } from 'src/auth/types';
import { AssetRequestService } from './asset-request.service';
import { CreateAssetRequestDTO } from './dto/create-asset-request.dto';
import { GetAssetRequestsDTO } from './dto/get-asset-requests.dto';
import { AssignAssetDTO } from './dto/assign-asset.dto';

@Controller('asset-requests')
export class AssetRequestController {
  constructor(private readonly assetRequestService: AssetRequestService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN', 'HR')
  @Get('/')
  async getAssetRequests(
    @User() user: PayloadToken,
    @Query() query: GetAssetRequestsDTO,
  ) {
    return this.assetRequestService.getAssetRequests(query, user);
  }

  @Get('/:id')
  async getAssetRequest(@Param('id') id: number) {
    return this.assetRequestService.getAssetRequest(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER')
  @Post('/')
  async createAssetRequest(
    @User() user: PayloadToken,
    @Body() dto: CreateAssetRequestDTO,
  ) {
    return await this.assetRequestService.createAssetRequest(
      dto,
      Number(user.id),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/assign')
  async assignAsset(@User() user: PayloadToken, @Body() dto: AssignAssetDTO) {
    return await this.assetRequestService.assignAsset(dto, Number(user.id));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('HR')
  @Patch('/:id/approve')
  async approveAssetRequest(
    @User() user: PayloadToken,
    @Param('id') id: number,
  ) {
    return await this.assetRequestService.approveAssetRequest(
      id,
      Number(user.id),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('HR', 'ADMIN')
  @Patch('/:id/reject')
  async rejectAssetRequest(
    @User() user: PayloadToken,
    @Param('id') id: number,
  ) {
    return await this.assetRequestService.rejectAssetRequest(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  @Patch('/:id/done')
  async doneAssetRequest(@User() user: PayloadToken, @Param('id') id: number) {
    return await this.assetRequestService.doneAssetRequest(id, user);
  }
}
