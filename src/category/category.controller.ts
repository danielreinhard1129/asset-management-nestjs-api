import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CategoryService } from './category.service';
import { GetCategoriesDTO } from './dto/get-categories.dto';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async getCategories(@Query() query: GetCategoriesDTO) {
    return this.categoryService.getCategories(query);
  }
}
