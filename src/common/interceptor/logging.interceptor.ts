import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Only log successful requests here
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        this.logger.log(
          `${method} ${url} ${statusCode} +${Date.now() - now}ms`,
        );
      }),
      catchError((error) => {
        // Don't log here, let the exception filter handle error logging
        // This prevents duplicate logs
        return throwError(() => error);
      }),
    );
  }
}
