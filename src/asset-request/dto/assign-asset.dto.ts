import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class AssignAssetDTO {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDTO)
  readonly bastItems: ItemDTO[];

  @IsNotEmpty()
  @IsNumber()
  readonly assetRequestId: number;
}

class ItemDTO {
  @IsNotEmpty()
  @IsNumber()
  readonly assetId: number;
}
