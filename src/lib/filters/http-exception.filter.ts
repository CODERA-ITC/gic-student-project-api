import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HTTP ERROR');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const resBody = exception.getResponse();

    // Extract message from different response formats
    let message: string | string[];
    if (typeof resBody === 'string') {
      message = resBody;
    } else if (typeof resBody === 'object' && resBody !== null) {
      message = (resBody as any).message || exception.message;
    } else {
      message = exception.message;
    }

    // Create consistent error response format
    const errorResponse = {
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      errors: Array.isArray(message) ? message : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Remove undefined fields
    Object.keys(errorResponse).forEach(
      (key) => errorResponse[key] === undefined && delete errorResponse[key],
    );

    response.status(status).json(errorResponse);

    // Log error with appropriate detail level
    const logMessage = `${request.method} ${request.url} - Status ${status}: ${exception.message}`;

    // Only show stack trace in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.error(logMessage, exception.stack);
    } else {
      this.logger.error(logMessage);
    }
  }
}
