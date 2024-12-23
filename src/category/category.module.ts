import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PaginationModule } from 'src/pagination/pagination.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [PaginationModule, CloudinaryModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
