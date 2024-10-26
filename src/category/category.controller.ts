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
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { GetCategoriesDTO } from './dto/get-categories.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getCategories(@Query() query: GetCategoriesDTO) {
    return this.categoryService.getCategories(query);
  }

  @Get('/:id')
  async getCategory(@Param('id') id: number) {
    return this.categoryService.getCategory(id);
  }

  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'categoryPhoto', maxCount: 1 }]),
  )
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('/')
  async createCategory(
    @Body() dto: CreateCategoryDTO,
    @UploadedFiles(
      new RequiredFilePipe({ categoryPhoto: 1 }),
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({ fileType: /\/(jpg|jpeg|png|avif)$/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 ** 2 }),
        ],
      }),
    )
    files: { categoryPhoto: Express.Multer.File[] },
  ) {
    return this.categoryService.createCategory(dto, files.categoryPhoto[0]);
  }

  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'categoryPhoto', maxCount: 1 }]),
  )
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('/:id')
  async updateCategory(
    @Param('id') id: number,
    @Body() dto: UpdateCategoryDTO,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: /\/(jpg|jpeg|png|avif)$/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 ** 2 }),
        ],
      }),
    )
    files: { categoryPhoto: Express.Multer.File[] },
  ) {
    const categoryPhoto = files?.categoryPhoto?.[0];
    return await this.categoryService.updateCategory(id, dto, categoryPhoto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('/:id')
  async deleteAsset(@Param('id') id: number) {
    await this.categoryService.deleteCategory(id);
    return { status: 'Asset category deleted' };
  }
}
