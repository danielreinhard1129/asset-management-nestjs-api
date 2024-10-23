import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetCategoriesDTO } from './dto/get-categories.dto';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getCategories(dto: GetCategoriesDTO) {
    const { page, sortBy, sortOrder, take, search, all } = dto;

    const whereClause: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.name = { contains: search };
    }

    let paginationArgs: Prisma.CategoryFindManyArgs = {};

    if (!all) {
      paginationArgs = {
        skip: (page - 1) * take,
        take,
      };
    }

    const [categories, count] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        ...paginationArgs,
      }),

      this.prisma.category.count({ where: whereClause }),
    ]);

    return {
      data: categories,
      meta: this.paginationService.generateMeta({
        page,
        take: all ? count : take,
        count,
      }),
    };
  }
}
