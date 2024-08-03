import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../config';
import { PayloadToken } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessTokenSecret || 'secret',
    });
  }

  async validate(payload: PayloadToken) {
    return {
      id: payload.id,
      role: payload.role,
    };
  }
}
