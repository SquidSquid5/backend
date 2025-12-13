import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
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
