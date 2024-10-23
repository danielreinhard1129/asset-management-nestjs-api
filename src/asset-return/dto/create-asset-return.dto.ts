import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class CreateAssetReturnDTO {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDTO)
  readonly items: ItemDTO[];
}

class ItemDTO {
  @IsNotEmpty()
  @IsNumber()
  readonly assetId: number;
}
