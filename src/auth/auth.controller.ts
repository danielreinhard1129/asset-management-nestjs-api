import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './decorator/role.decorator';
import { User } from './decorator/user.decorator';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/role.guard';
import { PayloadToken } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Post('register')
  async register(@Body() registerDto: RegisterDTO) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER')
  @Patch('change-password')
  async changePassword(
    @User() user: PayloadToken,
    @Body() dto: ChangePasswordDTO,
  ) {
    return this.authService.changePassword(dto, Number(user.id));
  }
}
