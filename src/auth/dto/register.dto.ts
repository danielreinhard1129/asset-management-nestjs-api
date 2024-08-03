import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsInt()
  @IsNotEmpty()
  departmentId: number;
}
