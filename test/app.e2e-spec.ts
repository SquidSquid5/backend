import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('User Registration (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        );
        app.useGlobalFilters(new HttpExceptionFilter());
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should register a user successfully', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users/register')
            .send({
                email: 'user@example.com',
                password: 'Password123',
                nickname: 'tester',
            })
            .expect(201);

        expect(response.body).toMatchObject({
            userId: expect.any(String),
            email: 'user@example.com',
            nickname: 'tester',
            createdAt: expect.any(String),
        });
    });

    it('should return duplicate error when email already exists', async () => {
        await request(app.getHttpServer()).post('/api/users/register').send({
            email: 'dup@example.com',
            password: 'Password123',
            nickname: 'tester',
        });

        const response = await request(app.getHttpServer())
            .post('/api/users/register')
            .send({
                email: 'dup@example.com',
                password: 'Password123',
                nickname: 'tester2',
            })
            .expect(400);

        expect(response.body).toMatchObject({
            errorCode: 'DUPLICATE_EMAIL',
            message: '이미 존재하는 이메일입니다.',
        });
    });

    it('should validate email format', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users/register')
            .send({
                email: 'invalid-email',
                password: 'Password123',
                nickname: 'tester',
            })
            .expect(400);

        expect(response.body.errorCode).toBe('INVALID_EMAIL_FORMAT');
    });

    it('should validate password strength', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users/register')
            .send({
                email: 'user2@example.com',
                password: 'weak',
                nickname: 'tester',
            })
            .expect(400);

        expect(response.body.errorCode).toBe('WEAK_PASSWORD');
    });

    it('should validate nickname rules', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users/register')
            .send({
                email: 'user3@example.com',
                password: 'Password123',
                nickname: 'a',
            })
            .expect(400);

        expect(response.body.errorCode).toBe('INVALID_NICKNAME');
    });
});
