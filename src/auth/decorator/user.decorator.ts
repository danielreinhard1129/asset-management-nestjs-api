import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadToken } from '../types';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PayloadToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as PayloadToken;
  },
);
