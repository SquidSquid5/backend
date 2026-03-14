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
            const body = resBody as Record<string, unknown>;
            const bodyMessage = body.message;
            const bodyCode = body.errorCode;
            const message =
                typeof resBody === 'string'
                    ? resBody
                    : Array.isArray(bodyMessage)
                      ? bodyMessage.join(', ')
                      : typeof bodyMessage === 'string'
                        ? bodyMessage
                        : exception.message;
            const errorCode =
                typeof bodyCode === 'string'
                    ? bodyCode
                    : this.mapHttpStatusToCode(status);

            response.status(status).json({
                errorCode,
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
            errorCode: 'INTERNAL_ERROR',
            message: 'An internal server error occurred.',
        });
    }

    private mapHttpStatusToCode(status: number): string {
        if (status === 400) {
            return 'INVALID_INPUT';
        }

        if (status === 401) {
            return 'UNAUTHORIZED';
        }

        if (status === 403) {
            return 'ACCESS_DENIED';
        }

        if (status === 404) {
            return 'NOT_FOUND';
        }

        if (status >= 500) {
            return 'INTERNAL_ERROR';
        }

        return 'INVALID_INPUT';
    }
}
