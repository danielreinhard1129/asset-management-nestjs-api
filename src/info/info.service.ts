import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InfoService {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalResources() {
    const [totalAsset, totalUser, totalBast] = await Promise.all([
      this.prisma.asset.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.bast.count(),
    ]);

    return { totalAsset, totalUser, totalBast };
  }

  // async getTotalAssetByStatus() {
  //   const statuses = [
  //     { name: 'AVAILABLE', color: 'green' },
  //     { name: 'IN_PROGRESS', color: 'gray' },
  //     { name: 'IN_USE', color: 'blue' },
  //     { name: 'MAINTENANCE', color: 'orange' },
  //     { name: 'RETIRED', color: 'yellow' },
  //     { name: 'MISSING', color: 'violet' },
  //     { name: 'BROKEN', color: 'red' },
  //   ];

  //   const assetsByStatus = await this.prisma.asset.groupBy({
  //     by: ['status'],
  //     _count: {
  //       status: true,
  //     },
  //   });

  //   const assetStatusMap = assetsByStatus.reduce(
  //     (acc, statusGroup) => {
  //       acc[statusGroup.status] = statusGroup._count.status;
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   return statuses.map(({ name, color }) => ({
  //     name,
  //     color,
  //     value: assetStatusMap[name] || 0,
  //   }));
  // }

  async getTotalAssetByStatus() {
    const statuses = [
      { name: 'AVAILABLE', color: 'green' },
      { name: 'IN_PROGRESS', color: 'gray' },
      { name: 'IN_USE', color: 'blue' },
      { name: 'MAINTENANCE', color: 'orange' },
      { name: 'RETIRED', color: 'yellow' },
      { name: 'MISSING', color: 'violet' },
      { name: 'BROKEN', color: 'red' },
    ];

    const assets = await this.prisma.asset.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        status: true,
      },
    });

    const assetStatusMap = assets.reduce(
      (acc, { status }) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return statuses.map(({ name, color }) => ({
      name,
      color,
      value: assetStatusMap[name] || 0,
    }));
  }
}
