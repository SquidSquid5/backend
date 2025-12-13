import { User } from '@user/domain/entities/user.entity';

export interface RegisterUserCommand {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginUserCommand {
    email: string;
    password: string;
}

export interface LoginResult {
    user: User;
    token: string;
}

export interface UserUseCase {
    register(command: RegisterUserCommand): Promise<User>;
    login(command: LoginUserCommand): Promise<LoginResult>;
}

export const USER_USE_CASE = Symbol('USER_USE_CASE');
