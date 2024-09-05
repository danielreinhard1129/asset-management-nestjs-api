import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.dto';

export class GetDepartmentsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;
}
