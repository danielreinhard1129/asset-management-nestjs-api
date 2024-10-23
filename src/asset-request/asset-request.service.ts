import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, StatusAssetRequest, Type, TypeBast } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssetRequestDTO } from './dto/create-asset-request.dto';
import { GetAssetRequestsDTO } from './dto/get-asset-requests.dto';
import { PayloadToken } from 'src/auth/types';
import { BastService } from 'src/bast/bast.service';
import { AssignAssetDTO } from './dto/assign-asset.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { format } from 'date-fns';

@Injectable()
export class AssetRequestService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private readonly paginationService: PaginationService,
    private readonly bastService: BastService,
  ) {}

  async getAssetRequests(dto: GetAssetRequestsDTO, user: PayloadToken) {
    const { page, sortBy, sortOrder, take, search, status, myRequest } = dto;
    const whereClause: Prisma.AssetRequestWhereInput = {};

    if (search) {
      whereClause.bast = { bastNo: { contains: search } };
    }

    if (status) {
      whereClause.status = status;
    }

    if (myRequest) {
      whereClause.userId = { equals: user.id };
    }
    const [assetRequests, count] = await this.prisma.$transaction([
      this.prisma.assetRequest.findMany({
        where: whereClause,
        skip: (page - 1) * take,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          bast: true,
          user: { select: { id: true, firstName: true, lastName: true } },
          assetRequestItems: { include: { category: true } },
        },
      }),
      this.prisma.assetRequest.count({ where: whereClause }),
    ]);

    return {
      data: assetRequests,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }

  async getAssetRequest(id: number) {
    return this.prisma.assetRequest.findFirstOrThrow({
      where: { id },
      include: {
        assetRequestItems: { include: { category: true } },
        bast: { include: { bastItems: { include: { asset: true } } } },
      },
    });
  }

  async createAssetRequest(dto: CreateAssetRequestDTO, userId: number) {
    const categoryIds = dto.items.map((item) => item.id);

    const countCategory = await this.prisma.category.count({
      where: {
        id: { in: categoryIds },
        deletedAt: null,
      },
    });

    if (countCategory !== categoryIds.length) {
      throw new UnprocessableEntityException(
        'One or more IDs do not exist in the database.',
      );
    }

    const bastNo = this.bastService.generateBastNo('REQ');

    return this.prisma.$transaction(async (tx) => {
      const bast = await tx.bast.create({
        data: {
          bastNo,
          type: TypeBast.REQUEST,
        },
      });

      const assetRequest = await tx.assetRequest.create({
        data: {
          userId,
          assignToUser: dto.assignToUser,
          bastId: bast.id,
          status: StatusAssetRequest.PENDING,
        },
      });

      const assetRequestItems = dto.items.map((item) => ({
        assetRequestId: assetRequest.id,
        categoryId: item.id,
        qty: item.qty,
      }));

      await tx.assetRequestItem.createMany({
        data: assetRequestItems,
      });

      return assetRequest;
    });
  }

  async approveAssetRequest(id: number, hrId: number) {
    const assetRequest = await this.prisma.assetRequest.findFirstOrThrow({
      where: { id },
      include: { bast: true },
    });

    if (assetRequest.bast.hrId) {
      throw new UnprocessableEntityException(
        `Asset request already in progress and approved by HR id : ${assetRequest.bast.hrId}`,
      );
    }

    if (['APPROVE', 'CLAIMED', 'REJECT'].includes(assetRequest.status)) {
      throw new UnprocessableEntityException(`Asset request already finished`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.bast.update({
        where: { id: assetRequest.bastId },
        data: { hrId },
      });

      return await tx.assetRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    });
  }

  async assignAsset(dto: AssignAssetDTO, adminId: number) {
    const { bastId, bast, user } =
      await this.prisma.assetRequest.findFirstOrThrow({
        where: { id: dto.assetRequestId },
        include: {
          bast: true,
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      });

    if (bast.adminId) {
      throw new UnprocessableEntityException(
        `Asset assignment has already been done by admin with ID: ${bast.adminId}`,
      );
    }

    const bastItems = dto.bastItems;

    const assetIds = bastItems.map((item) => item.assetId);

    const duplicates = assetIds.filter(
      (item, index) => assetIds.indexOf(item) !== index,
    );

    if (bastItems.some((item) => item.assetId === 0) || duplicates.length > 0) {
      throw new UnprocessableEntityException(
        'Invalid asset IDs: assetId cannot be 0 and must be unique.',
      );
    }

    const bastItemsWithId = bastItems.map(({ assetId }) => ({
      assetId,
      bastId,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.bast.update({
        where: { id: bastId },
        data: { adminId },
      });

      await tx.bastItem.createMany({
        data: bastItemsWithId,
      });
    });

    const assets = await this.prisma.asset.findMany({
      where: { id: { in: assetIds } },
    });

    this.mailerService.sendMail({
      to: user.email,
      subject: `Asset Request Approve - ${bast.bastNo}`,
      template: './asset-request',
      context: {
        name: `${user.firstName} ${user.lastName}`,
        date: `${format(bast.createdAt, 'dd MMM yyyy - hh:mm')}`,
        bastNo: `${bast.bastNo}`,
        items: assets.map(({ name }) => ({
          name,
        })),
      },
    });

    return {
      message: 'Assign asset success',
    };
  }

  async rejectAssetRequest(id: number) {
    const { bast, status } = await this.prisma.assetRequest.findFirstOrThrow({
      where: { id },
      include: { bast: true },
    });

    // const canReject =
    //   (user.role === 'HR' && !bast.hrId && status === 'PENDING') ||
    //   (user.role === 'ADMIN' && bast.hrId && !bast.adminId);

    // if (!canReject) {
    //   throw new UnprocessableEntityException('Cannot reject asset request');
    // }

    if (bast.adminId) {
      throw new UnprocessableEntityException(
        'Cannot reject asset request after assign',
      );
    }

    if (['CLAIMED', 'APPROVE', 'REJECT'].includes(status)) {
      throw new UnprocessableEntityException('Asset request already finished');
    }

    return await this.prisma.assetRequest.update({
      where: { id },
      data: { status: 'REJECT' },
    });
  }

  async doneAssetRequest(id: number, user: PayloadToken) {
    const assetRequest = await this.prisma.assetRequest.findFirstOrThrow({
      where: { id },
      include: { bast: { include: { bastItems: true } } },
    });

    const { bastId, bast, status, userId } = assetRequest;

    const transactionActions = [];

    if (user.role === 'USER') {
      if (bast.isCheckedByUser || status === 'CLAIMED') {
        throw new UnprocessableEntityException('Asset Request already claimed');
      }

      transactionActions.push(
        this.prisma.bast.update({
          where: { id: bastId },
          data: { isCheckedByUser: true },
        }),
        this.prisma.assetRequest.update({
          where: { id },
          data: { status: 'CLAIMED' },
        }),
      );
    } else {
      if (!bast.isCheckedByUser) {
        throw new UnprocessableEntityException(
          'Cannot proceed before user claimed the asset',
        );
      }
      if (bast.isCheckedByAdmin || status === 'APPROVE') {
        throw new UnprocessableEntityException('Asset Request already done');
      }

      const assetIds = bast.bastItems.map((item) => item.assetId);
      const assetHistories = assetIds.map((assetId) => ({
        userId,
        adminId: user.id,
        assetId,
        type: Type.CHECKOUT,
      }));

      transactionActions.push(
        this.prisma.bast.update({
          where: { id: bastId },
          data: { isCheckedByAdmin: true },
        }),
        this.prisma.assetRequest.update({
          where: { id },
          data: { status: 'APPROVE' },
        }),
        this.prisma.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { status: 'IN_USE', userId },
        }),
        this.prisma.assetHistory.createMany({
          data: assetHistories,
        }),
      );
    }

    await this.prisma.$transaction(transactionActions);

    const message =
      user.role === 'ADMIN' ? 'Asset request finished' : 'Claim asset success';

    return { message };
  }
}
