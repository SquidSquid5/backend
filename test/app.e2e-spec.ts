import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import {
    TOKEN_BLACKLIST,
    type TokenBlacklist,
} from '../src/modules/user/domain/ports/outbound/token.blacklist';

async function createApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    return app;
}

function registerUser(
    app: INestApplication,
    email: string,
    password = 'Password123',
    nickname = 'tester',
) {
    return request(app.getHttpServer())
        .post('/api/users/register')
        .send({ email, password, nickname });
}

function loginUser(
    app: INestApplication,
    email: string,
    password = 'Password123',
) {
    return request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email, password });
}

function logoutUser(app: INestApplication, token: string) {
    return request(app.getHttpServer())
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${token}`);
}

describe('User Registration (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        app = await createApp();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should register a user successfully', async () => {
        const response = await registerUser(
            app,
            'user@example.com',
            'Password123',
            'tester',
        ).expect(201);

        expect(response.body).toMatchObject({
            userId: expect.any(String),
            email: 'user@example.com',
            nickname: 'tester',
            createdAt: expect.any(String),
        });
    });

    it('should return duplicate error when email already exists', async () => {
        await registerUser(app, 'dup@example.com').expect(201);

        const response = await registerUser(
            app,
            'dup@example.com',
            'Password123',
            'tester2',
        ).expect(400);

        expect(response.body).toMatchObject({
            errorCode: 'DUPLICATE_EMAIL',
            message: '이미 존재하는 이메일입니다.',
        });
    });

    it('should validate email format', async () => {
        const response = await registerUser(
            app,
            'invalid-email',
            'Password123',
            'tester',
        ).expect(400);

        expect(response.body.errorCode).toBe('INVALID_EMAIL_FORMAT');
    });

    it('should validate password strength', async () => {
        const response = await registerUser(
            app,
            'user2@example.com',
            'weak',
            'tester',
        ).expect(400);

        expect(response.body.errorCode).toBe('WEAK_PASSWORD');
    });

    it('should validate nickname rules', async () => {
        const response = await registerUser(
            app,
            'user3@example.com',
            'Password123',
            'a',
        ).expect(400);

        expect(response.body.errorCode).toBe('INVALID_NICKNAME');
    });
});

describe('User Login (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        app = await createApp();
        await registerUser(app, 'login@example.com').expect(201);
    });

    afterEach(async () => {
        await app.close();
    });

    it('should login successfully after registration', async () => {
        const loginResponse = await loginUser(app, 'login@example.com').expect(
            200,
        );

        expect(loginResponse.body).toMatchObject({
            userId: expect.any(String),
            token: expect.any(String),
            nickname: 'tester',
        });

        const decoded = jwt.verify(
            loginResponse.body.token,
            process.env.JWT_SECRET ?? 'dev-secret',
        ) as jwt.JwtPayload;
        expect(decoded.email).toBe('login@example.com');
    });

    it('should return invalid credentials for unknown email', async () => {
        const response = await loginUser(app, 'unknown@example.com').expect(
            401,
        );

        expect(response.body).toMatchObject({
            errorCode: 'INVALID_CREDENTIALS',
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
    });

    it('should return invalid credentials for wrong password', async () => {
        const response = await loginUser(
            app,
            'login@example.com',
            'Invalid123',
        ).expect(401);

        expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should validate email format in login', async () => {
        const response = await loginUser(app, 'invalid-email').expect(400);

        expect(response.body.errorCode).toBe('INVALID_EMAIL_FORMAT');
    });

    it('should return validation error when password is missing', async () => {
        await loginUser(app, 'login@example.com', '').expect(400);
    });
});

describe('User Logout (e2e)', () => {
    let app: INestApplication;
    let tokenBlacklist: TokenBlacklist;

    beforeEach(async () => {
        app = await createApp();
        tokenBlacklist = app.get<TokenBlacklist>(TOKEN_BLACKLIST);
        await registerUser(app, 'logout@example.com').expect(201);
    });

    afterEach(async () => {
        await app.close();
    });

    it('should logout and blacklist token', async () => {
        const login = await loginUser(app, 'logout@example.com').expect(200);
        const token = login.body.token;

        await logoutUser(app, token).expect(200);
        await expect(tokenBlacklist.isBlacklisted(token)).resolves.toBe(true);
    });
});
