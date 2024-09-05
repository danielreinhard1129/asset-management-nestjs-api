import { IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDTO {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly address?: string;
}
