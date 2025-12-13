import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseError } from '@common/errors/base.error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    public catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof BaseError) {
            response.status(exception.httpStatus).json({
                errorCode: exception.toClientCode(),
                message: exception.message,
            });
            return;
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const resBody = exception.getResponse();
            const bodyMessage = (resBody as Record<string, unknown>).message;
            const message =
                typeof resBody === 'string'
                    ? resBody
                    : Array.isArray(bodyMessage)
                      ? bodyMessage.join(', ')
                      : typeof bodyMessage === 'string'
                        ? bodyMessage
                        : exception.message;

            response.status(status).json({
                errorCode: 'BAD_REQUEST',
                message,
            });
            return;
        }

        const error = exception as Error;
        const stack = error?.stack ?? JSON.stringify(exception);
        this.logger.error(
            `Unhandled exception on ${request.method} ${request.url}`,
            stack,
        );

        response.status(500).json({
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: '내부 서버 오류가 발생했습니다.',
        });
    }
}
