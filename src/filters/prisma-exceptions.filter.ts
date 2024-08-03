import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    /**
     * This checks whether the generated prisma client error is a not found error
     * Source: https://www.prisma.io/docs/orm/reference/error-reference#error-codes
     */

    switch (exception.code) {
      case 'P2025': {
        response.status(HttpStatus.NOT_FOUND).json({
          message: exception.message,
        });
        break;
      }
      case 'P2002': {
        response.status(HttpStatus.CONFLICT).json({
          message: `Unique constraint failed on the ${exception.meta.target}`,
        });
        break;
      }
      // Add other prisma error codes here
      default: {
        response.status(HttpStatus.BAD_REQUEST).json({
          message: exception.message,
        });
        break;
      }
    }
  }
}
