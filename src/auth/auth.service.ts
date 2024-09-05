import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { config } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { prismaExclude } from 'src/prisma/utils';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { department: { select: { name: true } } },
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

    const hashedPassword = await hash(registerDto.password, config.saltRounds);

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
}
