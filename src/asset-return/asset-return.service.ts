import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, StatusAssetReturned, Type, TypeBast } from '@prisma/client';
import { BastService } from 'src/bast/bast.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssetReturnDTO } from './dto/create-asset-return.dto';
import { GetAssetReturnedDTO } from './dto/get-asset-returned.dto';
import { PayloadToken } from 'src/auth/types';
import { MailerService } from '@nestjs-modules/mailer';
import { format } from 'date-fns';

@Injectable()
export class AssetReturnService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private readonly paginationService: PaginationService,
    private readonly bastService: BastService,
  ) {}

  async getAssetReturned(dto: GetAssetReturnedDTO, user: PayloadToken) {
    const { page, sortBy, sortOrder, take, search, status, myReturn } = dto;

    const whereClause: Prisma.AssetReturnedWhereInput = {};

    if (search) {
      whereClause.bast = { bastNo: { contains: search } };
    }

    if (status) {
      whereClause.status = status;
    }

    if (myReturn) {
      whereClause.userId = { equals: user.id };
    }

    const [assetReturned, count] = await this.prisma.$transaction([
      this.prisma.assetReturned.findMany({
        where: whereClause,
        skip: (page - 1) * take,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          bast: { include: { bastItems: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.assetReturned.count({ where: whereClause }),
    ]);

    return {
      data: assetReturned,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }

  async getAssetReturn(id: number) {
    return this.prisma.assetReturned.findFirstOrThrow({
      where: { id },
      include: {
        bast: { include: { bastItems: { include: { asset: true } } } },
      },
    });
  }

  async createAssetReturned(dto: CreateAssetReturnDTO, userId: number) {
    const assetIds = dto.items.map((item) => item.assetId);

    // Check if any of the assets already have an existing return
    const existingReturns = await this.prisma.assetReturned.findMany({
      where: {
        bast: {
          bastItems: {
            some: {
              assetId: { in: assetIds },
            },
          },
        },
        status: {
          notIn: [StatusAssetReturned.DONE, StatusAssetReturned.REJECT],
        },
      },
    });

    if (existingReturns.length > 0) {
      throw new UnprocessableEntityException(
        'One or more assets are already in the process of being returned.',
      );
    }

    const countAsset = await this.prisma.asset.count({
      where: {
        id: { in: assetIds },
        deletedAt: null,
      },
    });

    if (countAsset !== assetIds.length) {
      throw new UnprocessableEntityException(
        'One or more IDs do not exist in the database.',
      );
    }

    const bastNo = this.bastService.generateBastNo('RTN');

    return this.prisma.$transaction(async (tx) => {
      const bast = await tx.bast.create({
        data: {
          bastNo,
          type: TypeBast.RETURN,
        },
      });

      const bastItems = dto.items.map((item) => ({
        bastId: bast.id,
        assetId: item.assetId,
      }));

      await tx.bastItem.createMany({
        data: bastItems,
      });

      const assetReturned = await tx.assetReturned.create({
        data: {
          userId,
          bastId: bast.id,
          status: StatusAssetReturned.PENDING,
        },
      });

      return assetReturned;
    });
  }

  async approveAssetReturn(id: number, hrId: number) {
    const assetReturn = await this.prisma.assetReturned.findFirstOrThrow({
      where: { id },
      include: {
        bast: { include: { bastItems: { include: { asset: true } } } },
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    if (assetReturn.status === 'IN_PROGRESS') {
      throw new UnprocessableEntityException(
        `Asset return already approve by hr id : ${assetReturn.bast.hrId}`,
      );
    }

    if (['DONE', 'REJECT'].includes(assetReturn.status)) {
      throw new UnprocessableEntityException(`Asset return already finished`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.bast.update({
        where: { id: assetReturn.bastId },
        data: { hrId },
      });

      await tx.notification.create({
        data: {
          title: 'Asset Return Approved by HR',
          description: 'Your asset return request has been approved by HR.',
          userId: assetReturn.userId,
        },
      });

      return await tx.assetReturned.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    });

    this.mailerService.sendMail({
      to: assetReturn.user.email,
      subject: `Asset Return Approve - ${assetReturn.bast.bastNo}`,
      template: './asset-return',
      context: {
        name: `${assetReturn.user.firstName} ${assetReturn.user.lastName}`,
        date: `${format(assetReturn.bast.createdAt, 'dd MMM yyyy - hh:mm')}`,
        bastNo: `${assetReturn.bast.bastNo}`,
        items: assetReturn.bast.bastItems.map((item) => ({
          name: item.asset.name,
        })),
      },
    });

    return { message: 'Approve asset return success' };
  }

  // async doneAssetReturn(id: number, adminId: number) {
  //   const assetReturn = await this.prisma.assetReturned.findFirstOrThrow({
  //     where: { id },
  //     include: { bast: { include: { bastItems: true } } },
  //   });

  //   const { bastId, bast, status } = assetReturn;

  //   const transactionActions = [];

  //   if (status === 'PENDING') {
  //     throw new UnprocessableEntityException(
  //       'Cannot proceed before HR approve',
  //     );
  //   }

  //   if (bast.isCheckedByAdmin || ['DONE', 'REJECT'].includes(status)) {
  //     throw new UnprocessableEntityException('Asset return already finished');
  //   }

  //   const assetIds = bast.bastItems.map((item) => item.assetId);

  //   const assetHistories = assetIds.map((assetId) => ({
  //     adminId,
  //     assetId,
  //     type: Type.UPDATE,
  //   }));

  //   transactionActions.push(
  //     this.prisma.bast.update({
  //       where: { id: bastId },
  //       data: { isCheckedByAdmin: true, adminId },
  //     }),
  //     this.prisma.assetReturned.update({
  //       where: { id },
  //       data: { status: 'DONE' },
  //     }),
  //     this.prisma.asset.updateMany({
  //       where: { id: { in: assetIds } },
  //       data: { status: 'AVAILABLE', userId: null },
  //     }),
  //     this.prisma.assetHistory.createMany({
  //       data: assetHistories,
  //     }),
  //     this.prisma.notification.create({
  //       data: {
  //         title: 'Asset Return Marked as Done by Admin',
  //         description:
  //           'Your asset return has been marked as done by the admin.',
  //         userId: assetReturn.userId,
  //       },
  //     }),
  //   );

  //   await this.prisma.$transaction(transactionActions);

  //   return { message: 'Asset return done' };
  // }

  async doneAssetReturn(id: number, adminId: number) {
    await this.prisma.$transaction(async (tx) => {
      const assetReturn = await tx.assetReturned.findFirstOrThrow({
        where: { id },
        include: { bast: { include: { bastItems: true } } },
      });

      const { bastId, bast, status } = assetReturn;

      const transactionActions = [];

      if (status === 'PENDING') {
        throw new UnprocessableEntityException(
          'Cannot proceed before HR approves',
        );
      }

      if (bast.isCheckedByAdmin || ['DONE', 'REJECT'].includes(status)) {
        throw new UnprocessableEntityException('Asset return already finished');
      }

      const assetIds = bast.bastItems.map((item) => item.assetId);

      const assetHistories = assetIds.map((assetId) => ({
        adminId,
        assetId,
        type: Type.UPDATE,
      }));

      transactionActions.push(
        tx.bast.update({
          where: { id: bastId },
          data: { isCheckedByAdmin: true, adminId },
        }),
        tx.assetReturned.update({
          where: { id },
          data: { status: 'DONE' },
        }),
        tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { status: 'AVAILABLE', userId: null },
        }),
        tx.assetHistory.createMany({
          data: assetHistories,
        }),
        tx.notification.create({
          data: {
            title: 'Asset Return Marked as Done by Admin',
            description:
              'Your asset return has been marked as done by the admin.',
            userId: assetReturn.userId,
          },
        }),
      );

      await Promise.all(transactionActions);

      return { message: 'Asset return done' };
    });
  }

  async rejectAssetReturn(id: number) {
    const { status, userId } = await this.prisma.assetReturned.findFirstOrThrow(
      {
        where: { id },
        include: { bast: true },
      },
    );

    if (['DONE', 'REJECT'].includes(status)) {
      throw new UnprocessableEntityException('Asset return already finished');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.notification.create({
        data: {
          title: 'Asset Return Rejected',
          description: 'Your asset return request has been rejected.',
          userId,
        },
      });

      return await tx.assetReturned.update({
        where: { id },
        data: { status: 'REJECT' },
      });
    });
  }
}
