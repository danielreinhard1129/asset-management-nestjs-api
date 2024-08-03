import { Status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateAssetDTO {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly tag: string;

  @IsNotEmpty()
  @IsString()
  readonly serial: string;

  @IsNotEmpty()
  @IsDateString()
  readonly purchaseDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transform to number
  readonly purchasePrice: number;

  @IsNotEmpty()
  @IsEnum(Status)
  readonly status: Status;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transform to number
  readonly categoryId: number;
}
