import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { DepartmentService } from './department.service';
import { GetDepartmentsDTO } from './dto/get-departments.dto';
import { CreateDepartmentDTO } from './dto/create-departments.dto';
import { UpdateDepartmentDTO } from './dto/update-department.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('/')
  async getDepartments(@Query() query: GetDepartmentsDTO) {
    return await this.departmentService.getDepartments(query);
  }

  @Post('/')
  async createDepartment(@Body() dto: CreateDepartmentDTO) {
    return await this.departmentService.createDepartment(dto);
  }

  @Patch('/:id')
  async updateDepartment(
    @Param('id') id: number,
    @Body() dto: UpdateDepartmentDTO,
  ) {
    return await this.departmentService.updateDepartment(id, dto);
  }

  @Delete('/:id')
  async deleteDepartment(@Param('id') id: number) {
    return await this.departmentService.deleteDepartment(id);
  }
}
