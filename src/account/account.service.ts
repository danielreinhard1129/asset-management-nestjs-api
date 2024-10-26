import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { config } from 'src/config';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaExclude } from 'src/prisma/utils';
import { CreateAccountDTO } from './dto/create-account.dto';
import { GetAccountsDTO } from './dto/get-accounts.dto';
import { UpdateAccountDTO } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAccounts(dto: GetAccountsDTO) {
    const { page, sortBy, sortOrder, take, all, search } = dto;

    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [{ email: { contains: search } }];
    }

    let paginationArgs: Prisma.UserFindManyArgs = {};

    if (!all) {
      paginationArgs = {
        skip: (page - 1) * take,
        take,
      };
    }

    const [accounts, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: { department: true },
        ...paginationArgs,
      }),

      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: accounts,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }

  async getAccount(id: number) {
    const account = await this.prisma.user.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: { department: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = account;

    return userWithoutPassword;
  }

  async createAccount(dto: CreateAccountDTO) {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new UnprocessableEntityException('Email already exist');
    }

    if (!dto.password) {
      dto.password = 'Admin123'; // default password
    }

    const hashedPassword = await hash(dto.password, Number(config.saltRounds));

    return await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        departmentId: dto.departmentId,
      },
      select: prismaExclude('User', ['password']),
    });
  }

  async updateAccount(id: number, dto: UpdateAccountDTO) {
    await this.prisma.user.findFirstOrThrow({
      where: { id },
    });

    if (dto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new UnprocessableEntityException('Email already exist');
      }
    }

    if (dto.password) {
      dto.password = await hash(dto.password, Number(config.saltRounds));
    } else {
      delete dto.password;
    }

    return await this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async deleteAccount(id: number) {
    const { email } = await this.prisma.user.findFirstOrThrow({
      where: { id },
    });

    const assetInUse = await this.prisma.asset.findFirst({
      where: { userId: id },
    });

    if (assetInUse) {
      throw new UnprocessableEntityException(
        'Cannot delete account because there are assets still in use by this user',
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        email: `deleted-${email}`,
        deletedAt: new Date(),
      },
    });
  }
}
