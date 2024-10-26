import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetCategoriesDTO } from './dto/get-categories.dto';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateCategoryDTO } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
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

  async getCategory(id: number) {
    return await this.prisma.category.findFirstOrThrow({
      where: { id, deletedAt: null },
    });
  }

  async createCategory(
    dto: CreateCategoryDTO,
    categoryPhoto: Express.Multer.File,
  ) {
    const existingCategory = await this.prisma.category.findFirst({
      where: { name: dto.name },
    });

    if (existingCategory) {
      throw new UnprocessableEntityException(
        'Asset category name already exist',
      );
    }

    const { secure_url } =
      await this.cloudinaryService.uploadFile(categoryPhoto);

    return await this.prisma.category.create({
      data: {
        name: dto.name,
        image: secure_url,
      },
    });
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDTO,
    categoryPhoto?: Express.Multer.File,
  ) {
    const { image } = await this.prisma.category.findFirstOrThrow({
      where: { id },
    });

    if (dto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: { name: dto.name },
      });

      if (existingCategory) {
        throw new UnprocessableEntityException(
          'Asset category name already exist',
        );
      }
    }

    let updatedData: Prisma.CategoryUpdateInput = dto;

    if (categoryPhoto) {
      if (image) {
        await this.cloudinaryService.deleteFile(image);
      }

      const { secure_url } =
        await this.cloudinaryService.uploadFile(categoryPhoto);

      updatedData = { ...dto, image: secure_url };
    }

    return await this.prisma.category.update({
      where: { id },
      data: updatedData,
    });
  }

  async deleteCategory(id: number) {
    await this.prisma.category.findFirstOrThrow({
      where: { id },
    });

    await this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
