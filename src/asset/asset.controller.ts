import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { RequiredFilePipe } from 'src/cloudinary/pipes/required-file.pipe';
import { FileTypeValidator } from 'src/cloudinary/validators/file-type.validator';
import { MaxFileSizeValidator } from 'src/cloudinary/validators/max-file-size.validator';
import { AssetService } from './asset.service';
import { CreateAssetDTO } from './dto/create-asset.dto';
import { GetAssetsDTO } from './dto/get-assets.dto';
import { UpdateAssetDTO } from './dto/update-asset.dto';

@Controller('assets')
@UseGuards(AuthGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('/')
  async getAssets(@Query() query: GetAssetsDTO) {
    return this.assetService.getAssets(query);
  }

  @Get('/:id')
  async getAsset(@Param('id') id: number) {
    return this.assetService.getAsset(id);
  }

  @UseInterceptors(FileFieldsInterceptor([{ name: 'assetPhoto', maxCount: 1 }]))
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'EMPLOYEE')
  @Post('/')
  async createAsset(
    @Body() createAssetDto: CreateAssetDTO,
    @UploadedFiles(
      new RequiredFilePipe({ assetPhoto: 1 }),
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({ fileType: /\/(jpg|jpeg|png)$/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 ** 2 }),
        ],
      }),
    )
    files: { assetPhoto: Express.Multer.File[] },
  ) {
    return this.assetService.createAsset(createAssetDto, files.assetPhoto[0]);
  }

  @UseInterceptors(FileFieldsInterceptor([{ name: 'assetPhoto', maxCount: 1 }]))
  @Patch('/:id')
  async updateAsset(
    @Param('id') id: number,
    @Body() updateAssetDto: UpdateAssetDTO,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: /\/(jpg|jpeg|png)$/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 ** 2 }),
        ],
      }),
    )
    files: { assetPhoto: Express.Multer.File[] },
  ) {
    const assetPhoto = files?.assetPhoto?.[0];
    return await this.assetService.updateAsset(id, updateAssetDto, assetPhoto);
  }

  @Delete('/:id')
  async deleteAsset(@Param('id') id: number) {
    await this.assetService.deleteAsset(id);
    return { status: 'Asset deleted' };
  }
}
