import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: config.accessTokenSecret,
      signOptions: { expiresIn: config.accessTokenExpiry },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
