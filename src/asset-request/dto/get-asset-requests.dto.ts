import { StatusAssetRequest } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.dto';

export class GetAssetRequestsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsEnum(StatusAssetRequest)
  readonly status?: StatusAssetRequest;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  readonly myRequest?: boolean;
}
