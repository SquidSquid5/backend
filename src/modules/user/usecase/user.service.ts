import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
    type RegisterUserCommand,
    type LoginUserCommand,
    type UserUseCase,
    type LoginResult,
} from '@user/domain/ports/inbound/user.usecase';
import {
    DuplicateEmailError,
    InvalidCredentialsError,
} from '@user/domain/errors/user.errors';

@Injectable()
export class UserService implements UserUseCase {
    private readonly dummyPasswordHash =
        '$2b$10$CwTycUXWue0Thq9StjUM0uJ8A5C.WKoy0/uEM4L5EU9..qHo1Jgiu';

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,
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
}
