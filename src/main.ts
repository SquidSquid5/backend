import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    try {
        logger.log('Creating NestJS application...');
        const app = await NestFactory.create(AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });

        logger.log('Application created successfully');
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
                stopAtFirstError: true,
                exceptionFactory: (errors) => {
                    const firstError = errors[0];
                    const constraints = firstError?.constraints;
                    const message =
                        constraints !== undefined
                            ? Object.values(constraints)[0]
                            : '잘못된 요청입니다.';
                    return new BadRequestException({
                        errorCode: 'INVALID_INPUT',
                        message,
                    });
                },
            }),
        );
        app.useGlobalFilters(new HttpExceptionFilter());
        logger.log('Starting to listen on port 3000...');

        await app.listen(3000);

        logger.log(`Application is running on: ${await app.getUrl()}`);
    } catch (error) {
        logger.error('Failed to start application:', error);
        if (error instanceof Error) {
            logger.error('Error stack:', error.stack);
        }
        process.exit(1);
    }
}
void bootstrap();
