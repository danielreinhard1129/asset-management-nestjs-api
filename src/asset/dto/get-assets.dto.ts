import { Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/pagination/dto/pagination.dto';

export class GetAssetsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsEnum(Status)
  readonly status?: Status;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  readonly myAsset?: boolean;
}
