import { User } from '@user/domain/entities/user.entity';

export interface RegisterUserCommand {
    email: string;
    password: string;
    nickname: string;
}

export interface UserUseCase {
    register(command: RegisterUserCommand): Promise<User>;
}

export const USER_USE_CASE = Symbol('USER_USE_CASE');
