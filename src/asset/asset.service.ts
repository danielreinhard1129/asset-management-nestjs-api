import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PayloadToken } from 'src/auth/types';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssetDTO } from './dto/create-asset.dto';
import { GetAssetsDTO } from './dto/get-assets.dto';
import { UpdateAssetDTO } from './dto/update-asset.dto';

@Injectable()
export class AssetService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAssets(getAssetsDto: GetAssetsDTO, userId: number) {
    const { page, sortBy, sortOrder, take, all, search, status, myAsset } =
      getAssetsDto;

    const whereClause: Prisma.AssetWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { category: { name: { contains: search } } },
        { tag: { contains: search } },
        { serial: { contains: search } },
      ];
    }

    if (status) {
      whereClause.status = { equals: status };
    }

    if (myAsset) {
      whereClause.userId = { equals: userId };
    }

    let paginationArgs: Prisma.AssetFindManyArgs = {};

    if (!all) {
      paginationArgs = {
        skip: (page - 1) * take,
        take,
      };
    }

    const [assets, count] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: { category: { select: { name: true } } },
        ...paginationArgs,
      }),

      this.prisma.asset.count({ where: whereClause }),
    ]);

    return {
      data: assets,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }

  async getAsset(id: number) {
    return await this.prisma.asset.findFirstOrThrow({
      where: { id },
      include: {
        category: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async createAsset(
    user: PayloadToken,
    createAssetDto: CreateAssetDTO,
    assetPhoto: Express.Multer.File,
  ) {
    const {
      name,
      tag,
      serial,
      categoryId,
      purchaseDate,
      purchasePrice,
      status,
    } = createAssetDto;

    await Promise.all([
      this.prisma.asset.findFirst({ where: { tag } }),
      this.prisma.asset.findFirst({ where: { serial } }),
    ]).then(([tagAsset, serialAsset]) => {
      if (tagAsset) {
        throw new UnprocessableEntityException(
          'Asset with this tag already exists',
        );
      }

      if (serialAsset) {
        throw new UnprocessableEntityException(
          'Asset with this serial already exists',
        );
      }
    });

    const { secure_url } = await this.cloudinaryService.uploadFile(assetPhoto);

    return this.prisma.$transaction(async (tx) => {
      const newAsset = await tx.asset.create({
        data: {
          name,
          image: secure_url,
          purchaseDate,
          purchasePrice,
          serial,
          tag,
          categoryId,
          status,
        },
      });

      await tx.assetHistory.create({
        data: {
          type: 'CREATE',
          assetId: newAsset.id,
          adminId: user.id,
        },
      });

      return newAsset;
    });
  }

  async updateAsset(
    id: number,
    updateAssetDto: UpdateAssetDTO,
    user: PayloadToken,
    assetPhoto?: Express.Multer.File,
  ) {
    const { image } = await this.prisma.asset.findFirstOrThrow({
      where: { id },
    });

    let updatedData: Prisma.AssetUpdateInput = updateAssetDto;

    if (assetPhoto) {
      if (image) {
        await this.cloudinaryService.deleteFile(image);
      }

      const { secure_url } =
        await this.cloudinaryService.uploadFile(assetPhoto);

      updatedData = { ...updateAssetDto, image: secure_url };
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAsset = await this.prisma.asset.update({
        where: { id },
        data: updatedData,
      });

      await tx.assetHistory.create({
        data: {
          type: 'UPDATE',
          assetId: updatedAsset.id,
          adminId: user.id,
        },
      });

      return updatedAsset;
    });
  }

  async deleteAsset(id: number) {
    const { image } = await this.prisma.asset.findFirstOrThrow({
      where: { id },
    });

    await this.cloudinaryService.deleteFile(image);

    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
