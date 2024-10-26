import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccountDTO {
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsEnum(Role)
  readonly role: Role;

  @IsOptional()
  @IsString()
  password?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Transform to number
  readonly departmentId: number;
}
