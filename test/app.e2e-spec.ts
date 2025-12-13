import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('User Registration & Login (e2e)', () => {
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

    it('should login successfully after registration', async () => {
        const registerResponse = await request(app.getHttpServer())
            .post('/api/users/register')
            .send({
                email: 'login@example.com',
                password: 'Password123',
                nickname: 'tester',
            })
            .expect(201);

        const loginResponse = await request(app.getHttpServer())
            .post('/api/users/login')
            .send({
                email: 'login@example.com',
                password: 'Password123',
            })
            .expect(200);

        expect(loginResponse.body).toMatchObject({
            userId: registerResponse.body.userId,
            token: expect.any(String),
            nickname: 'tester',
        });

        const decoded = jwt.verify(
            loginResponse.body.token,
            process.env.JWT_SECRET ?? 'dev-secret',
        ) as jwt.JwtPayload;
        expect(decoded.userId).toBe(registerResponse.body.userId);
        expect(decoded.email).toBe('login@example.com');
    });

    it('should return invalid credentials for unknown email', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users/login')
            .send({
                email: 'unknown@example.com',
                password: 'Password123',
            })
            .expect(401);

        expect(response.body).toMatchObject({
            errorCode: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
    });

    it('should return invalid credentials for wrong password', async () => {
        await request(app.getHttpServer()).post('/api/users/register').send({
            email: 'wrongpass@example.com',
            password: 'Password123',
            nickname: 'tester',
        });

        const response = await request(app.getHttpServer())
            .post('/api/users/login')
            .send({
                email: 'wrongpass@example.com',
                password: 'Invalid123',
            })
            .expect(401);

        expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should validate email format in login', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/users/login')
            .send({
                email: 'invalid-email',
                password: 'Password123',
            })
            .expect(400);

        expect(response.body.errorCode).toBe('INVALID_EMAIL_FORMAT');
    });

    it('should return validation error when password is missing', async () => {
        await request(app.getHttpServer()).post('/api/users/register').send({
            email: 'missingpass@example.com',
            password: 'Password123',
            nickname: 'tester',
        });

        await request(app.getHttpServer())
            .post('/api/users/login')
            .send({
                email: 'missingpass@example.com',
            })
            .expect(400);
    });
});
