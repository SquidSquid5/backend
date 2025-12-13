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
    type RegisterUserCommand,
    type UserUseCase,
} from '@user/domain/ports/inbound/user.usecase';
import { DuplicateEmailError } from '@user/domain/errors/user.errors';

@Injectable()
export class UserService implements UserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
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
}
