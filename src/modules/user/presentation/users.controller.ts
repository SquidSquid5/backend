import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Req,
} from '@nestjs/common';
import {
    USER_USE_CASE,
    type UserUseCase,
} from '@user/domain/ports/inbound/user.usecase';
import { RegisterRequestDto } from '@user/presentation/dto/register-request.dto';
import { RegisterResponseDto } from '@user/presentation/dto/register-response.dto';
import { LoginRequestDto } from '@user/presentation/dto/login-request.dto';
import { LoginResponseDto } from '@user/presentation/dto/login-response.dto';
import { LogoutResponseDto } from '@user/presentation/dto/logout-response.dto';
import { GetMyInfoResponseDto } from '@user/presentation/dto/get-my-info-response.dto';
import {
    UnauthorizedError,
    TokenExpiredError,
} from '@user/domain/errors/user.errors';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

@Controller('api/users')
export class UsersController {
    constructor(
        @Inject(USER_USE_CASE)
        private readonly userUseCase: UserUseCase,
        @Inject('JWT_SECRET')
        private readonly jwtSecret: string,
    ) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    public async register(
        @Body() request: RegisterRequestDto,
    ): Promise<RegisterResponseDto> {
        const user = await this.userUseCase.register({
            email: request.email,
            password: request.password,
            nickname: request.nickname,
        });

        return new RegisterResponseDto(user);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    public async login(
        @Body() request: LoginRequestDto,
    ): Promise<LoginResponseDto> {
        const result = await this.userUseCase.login({
            email: request.email,
            password: request.password,
        });

        return new LoginResponseDto(result.user, result.token);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    public async logout(@Req() req: Request): Promise<LogoutResponseDto> {
        const token = this.extractToken(req);
        await this.userUseCase.logout({ token });
        return new LogoutResponseDto();
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    public async getMyInfo(
        @Req() req: Request,
    ): Promise<GetMyInfoResponseDto> {
        const token = this.extractToken(req);
        const decoded = this.verifyToken(token);

        if (!decoded.userId) {
            throw new UnauthorizedError();
        }

        const user = await this.userUseCase.getMyInfo({
            userId: decoded.userId,
        });

        return new GetMyInfoResponseDto(user.toPublicInfo());
    }

    private extractToken(req: Request): string {
        const authorization = req.headers.authorization;
        if (
            authorization === undefined ||
            authorization.startsWith('Bearer ') === false
        ) {
            throw new UnauthorizedError();
        }
        return authorization.substring(7);
    }

    private verifyToken(
        token: string,
    ): jwt.JwtPayload & { userId?: string } {
        try {
            return jwt.verify(token, this.jwtSecret) as jwt.JwtPayload & {
                userId?: string;
            };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new TokenExpiredError();
            }
            throw new UnauthorizedError();
        }
    }
}
