import { Status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAssetDTO {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly tag?: string;

  @IsOptional()
  @IsString()
  readonly serial?: string;

  @IsOptional()
  @IsDateString()
  readonly purchaseDate?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Transform to number
  readonly purchasePrice?: number;

  @IsOptional()
  @IsEnum(Status)
  readonly status?: Status;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Transform to number
  readonly categoryId?: number;
}
