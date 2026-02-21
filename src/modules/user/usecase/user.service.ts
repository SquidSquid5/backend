import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '@user/domain/entities/user.entity';
import { EmailValidator } from '@user/domain/validators/email.validator';
import { PasswordValidator } from '@user/domain/validators/password.validator';
import { NicknameValidator } from '@user/domain/validators/nickname.validator';
import {
    USER_REPOSITORY,
    type UserRepository,
} from '@user/domain/ports/outbound/user.repository';
import {
    PASSWORD_HASHER,
    type PasswordHasher,
} from '@user/domain/ports/outbound/password.hasher';
import {
    TOKEN_GENERATOR,
    type TokenGenerator,
} from '@user/domain/ports/outbound/token.generator';
import {
    TOKEN_BLACKLIST,
    type TokenBlacklist,
} from '@user/domain/ports/outbound/token.blacklist';
import {
    type RegisterUserCommand,
    type LoginUserCommand,
    type UserUseCase,
    type LoginResult,
    type LogoutUserCommand,
    type GetMyInfoCommand,
    type UpdateMyInfoCommand,
} from '@user/domain/ports/inbound/user.usecase';
import {
    DuplicateEmailError,
    InvalidCredentialsError,
    TokenExpiredError,
    UnauthorizedError,
    BlacklistFailedError,
    UserNotFoundError,
    InvalidPasswordError,
    InvalidProfileImageUrlError,
} from '@user/domain/errors/user.errors';

@Injectable()
export class UserService implements UserUseCase {
    private readonly dummyPasswordHash =
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8A5C.WKoy0/uEM4L5EU9..qHo1Jgiu';

    private readonly logger = new Logger(UserService.name);

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,
        @Inject(TOKEN_BLACKLIST)
        private readonly tokenBlacklist: TokenBlacklist,
        @Inject('JWT_SECRET')
        private readonly jwtSecret: string,
    ) {}

    public async register(command: RegisterUserCommand): Promise<User> {
        EmailValidator.validate(command.email);
        PasswordValidator.validate(command.password);
        NicknameValidator.validate(command.nickname);

        const existing = await this.userRepository.findByEmail(command.email);
        if (existing !== null) {
            throw new DuplicateEmailError(command.email);
        }

        const hashedPassword = await this.passwordHasher.hash(command.password);
        const user = User.create({
            id: randomUUID(),
            email: command.email,
            hashedPassword,
            nickname: command.nickname,
        });

        return this.userRepository.save(user);
    }

    public async login(command: LoginUserCommand): Promise<LoginResult> {
        EmailValidator.validate(command.email);

        const user = await this.userRepository.findByEmail(command.email);
        if (user === null) {
            await this.passwordHasher.verify(
                command.password,
                this.dummyPasswordHash,
            );
            throw new InvalidCredentialsError();
        }

        const isValid = await this.passwordHasher.verify(
            command.password,
            user.getHashedPassword(),
        );
        if (isValid === false) {
            throw new InvalidCredentialsError();
        }

        const token = this.tokenGenerator.generate({
            userId: user.getId(),
            email: user.getEmail(),
        });

        return { user, token };
    }

    public async logout(command: LogoutUserCommand): Promise<void> {
        const decoded = this.decodeToken(command.token);
        const expiresAt = this.getExpiresAt(decoded);

        try {
            await this.tokenBlacklist.add(command.token, expiresAt);
            this.logger.log(
                `Token blacklisted until ${expiresAt.toISOString()}`,
            );
        } catch (error) {
            throw new BlacklistFailedError(error);
        }
    }

    public async getMyInfo(command: GetMyInfoCommand): Promise<User> {
        const user = await this.userRepository.findById(command.userId);
        if (user === null) {
            this.logger.warn(`User not found: ${command.userId}`);
            throw new UserNotFoundError(command.userId);
        }
        return user;
    }

    public async updateMyInfo(command: UpdateMyInfoCommand): Promise<User> {
        const user = await this.userRepository.findById(command.userId);
        if (user === null) {
            this.logger.warn(`User not found: ${command.userId}`);
            throw new UserNotFoundError(command.userId);
        }

        let newHashedPassword: string | undefined;
        if (command.currentPassword && command.newPassword) {
            const isValid = await this.passwordHasher.verify(
                command.currentPassword,
                user.getHashedPassword(),
            );
            if (isValid === false) {
                throw new InvalidPasswordError();
            }

            PasswordValidator.validate(command.newPassword);
            newHashedPassword = await this.passwordHasher.hash(
                command.newPassword,
            );
        }

        if (command.nickname) {
            NicknameValidator.validate(command.nickname);
        }

        if (command.profileImage) {
            this.validateProfileImageUrl(command.profileImage);
        }

        const updatedUser = user.update({
            nickname: command.nickname,
            profileImage: command.profileImage,
            hashedPassword: newHashedPassword,
        });

        const savedUser = await this.userRepository.save(updatedUser);
        this.logger.log(`User updated: ${command.userId}`);
        return savedUser;
    }

    private validateProfileImageUrl(url: string): void {
        try {
            new URL(url);
        } catch {
            throw new InvalidProfileImageUrlError(url);
        }
    }

    private decodeToken(
        token: string,
    ): jwt.JwtPayload & { exp: number | undefined } {
        try {
            return jwt.verify(token, this.jwtSecret) as jwt.JwtPayload & {
                exp: number | undefined;
            };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new TokenExpiredError();
            }
            throw new UnauthorizedError();
        }
    }

    private getExpiresAt(decoded: { exp: number | undefined }): Date {
        if (decoded.exp === undefined) {
            throw new UnauthorizedError();
        }

        return new Date(decoded.exp * 1000);
    }
}
