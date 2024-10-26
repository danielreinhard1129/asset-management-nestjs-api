import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.dto';

export class GetAccountsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly search?: string;
}
