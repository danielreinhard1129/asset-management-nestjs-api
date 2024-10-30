import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetNotificationsDTO } from './dto/get-notifications.dto';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getNotifications(dto: GetNotificationsDTO, userId: number) {
    const { page, sortBy, sortOrder, take, search, all } = dto;

    const whereClause: Prisma.NotificationWhereInput = {
      userId,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let paginationArgs: Prisma.NotificationFindManyArgs = {};

    if (!all) {
      paginationArgs = {
        skip: (page - 1) * take,
        take,
      };
    }

    const [notifications, count] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        ...paginationArgs,
      }),

      this.prisma.notification.count({ where: whereClause }),
    ]);

    return {
      data: notifications,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }

  async getNotification(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirstOrThrow({
      where: { id },
    });

    if (notification.userId !== userId) {
      throw new UnauthorizedException();
    }

    return notification;
  }

  async getUnreadNotification(userId: number) {
    return await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async readNotification(id: number, userId: number) {
    const notification = await this.getNotification(id, userId);

    if (!notification.readAt) {
      return await this.prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }

    return notification;
  }
}
