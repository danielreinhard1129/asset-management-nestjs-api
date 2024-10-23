import { StatusAssetReturned } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.dto';

export class GetAssetReturnedDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsEnum(StatusAssetReturned)
  readonly status?: StatusAssetReturned;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  readonly myReturn?: boolean;
}
