import { Type } from 'class-transformer';
import {
  IsDateString,
  IsDecimal,
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
  readonly serial: string;

  @IsNotEmpty()
  @IsDateString()
  readonly purchaseDate: Date;

  @IsNotEmpty()
  @IsString()
  @IsDecimal()
  readonly purchasePrice: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transform to number
  readonly categoryId: number;
}
