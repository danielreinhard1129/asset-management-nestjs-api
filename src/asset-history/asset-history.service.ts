import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetAssetHistoriesDTO } from 'src/asset/dto/get-asset-histories.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetHistoryService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAssetHistories(dto: GetAssetHistoriesDTO) {
    const { page, sortBy, sortOrder, take, search } = dto;

    const whereClause: Prisma.AssetHistoryWhereInput = {};

    if (search) {
      whereClause.asset.name = { contains: search };
    }

    const [assetHistories, count] = await this.prisma.$transaction([
      this.prisma.assetHistory.findMany({
        where: whereClause,
        skip: (page - 1) * take,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          asset: true,
          admin: { select: { firstName: true, lastName: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      }),

      this.prisma.assetHistory.count({ where: whereClause }),
    ]);

    return {
      data: assetHistories,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }
}
