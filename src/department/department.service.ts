import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetDepartmentsDTO } from './dto/get-departments.dto';
import { Prisma } from '@prisma/client';
import { PaginationService } from 'src/pagination/pagination.service';
import { CreateDepartmentDTO } from './dto/create-departments.dto';
import { UpdateDepartmentDTO } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getDepartments(query: GetDepartmentsDTO) {
    const { page, take, sortBy, sortOrder, search, address, all } = query;

    const whereClause: Prisma.DepartmentWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (address) {
      whereClause.address = {
        contains: address,
      };
    }

    let paginationArgs: Prisma.DepartmentFindManyArgs = {};

    if (!all) {
      paginationArgs = {
        skip: (page - 1) * take,
        take,
      };
    }

    const [departments, count] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        ...paginationArgs,
      }),

      this.prisma.department.count({ where: whereClause }),
    ]);

    return {
      data: departments,
      meta: this.paginationService.generateMeta({ page, take, count }),
    };
  }

  async createDepartment(dto: CreateDepartmentDTO) {
    const { name, address } = dto;

    const department = await this.prisma.department.findFirst({
      where: { name: { contains: name }, address: { contains: address } },
    });

    if (department) {
      throw new UnprocessableEntityException('Department already exist');
    }

    return await this.prisma.department.create({ data: dto });
  }

  async updateDepartment(id: number, dto: UpdateDepartmentDTO) {
    const department = await this.prisma.department.findFirstOrThrow({
      where: { id },
    });

    if (dto.name && !dto.address) {
      const existingDepartmentWithSameName =
        await this.prisma.department.findFirst({
          where: {
            id: { not: id },
            name: dto.name,
            address: department.address,
          },
        });

      if (existingDepartmentWithSameName) {
        throw new UnprocessableEntityException(
          'A department with this name and address already exists.',
        );
      }
    } else if (dto.address && !dto.name) {
      const existingDepartmentWithSameAddress =
        await this.prisma.department.findFirst({
          where: {
            id: { not: id },
            name: department.name,
            address: dto.address,
          },
        });

      if (existingDepartmentWithSameAddress) {
        throw new UnprocessableEntityException(
          'A department with this name and address already exists.',
        );
      }
    } else {
      const existingDepartmentWithSameNameAndAddress =
        await this.prisma.department.findFirst({
          where: { id: { not: id }, name: dto.name, address: dto.address },
        });

      if (existingDepartmentWithSameNameAndAddress) {
        throw new UnprocessableEntityException(
          'A department with this name and address already exists.',
        );
      }
    }

    return await this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDepartment(id: number) {
    await this.prisma.department.findFirstOrThrow({ where: { id } });

    await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Delete department success' };
  }
}
