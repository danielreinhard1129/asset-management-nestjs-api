import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { config } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaExclude } from 'src/prisma/utils';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email, deletedAt: null },
      include: { department: { select: { name: true, address: true } } },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;

    const isPasswordValid = await compare(loginDto.password, password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign(
      { id: user.id, role: user.role },
      { secret: config.accessTokenSecret, expiresIn: config.accessTokenExpiry },
    );

    return { ...userWithoutPassword, accessToken };
  }

  async register(registerDto: RegisterDTO) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: registerDto.email,
      },
    });

    if (user) {
      throw new ForbiddenException('Email already exist');
    }

    const hashedPassword = await hash(
      registerDto.password,
      Number(config.saltRounds),
    );

    return await this.prisma.user.create({
      data: {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
        departmentId: registerDto.departmentId,
      },
      select: prismaExclude('User', ['password']),
    });
  }

  async changePassword(dto: ChangePasswordDTO, userId: number) {
    const { oldPassword, newPassword } = dto;

    const { password } = await this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    });

    const isPasswordValid = await compare(oldPassword, password);

    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Invalid old password');
    }

    const hashedPassword = await hash(newPassword, Number(config.saltRounds));

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Change password success',
    };
  }
}
