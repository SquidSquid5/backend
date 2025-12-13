import { UserService } from './user.service';
import { User } from '@user/domain/entities/user.entity';
import {
    DuplicateEmailError,
    InvalidEmailFormatError,
    InvalidCredentialsError,
    WeakPasswordError,
} from '@user/domain/errors/user.errors';
import type { UserRepository } from '@user/domain/ports/outbound/user.repository';
import type { PasswordHasher } from '@user/domain/ports/outbound/password.hasher';
import type { TokenGenerator } from '@user/domain/ports/outbound/token.generator';

describe('UserService', () => {
    let userRepository: jest.Mocked<UserRepository>;
    let passwordHasher: jest.Mocked<PasswordHasher>;
    let tokenGenerator: jest.Mocked<TokenGenerator>;
    let service: UserService;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            save: jest.fn(),
        };
        passwordHasher = {
            hash: jest.fn(),
            verify: jest.fn().mockResolvedValue(false),
        };
        tokenGenerator = {
            generate: jest.fn(),
        };
        service = new UserService(
            userRepository,
            passwordHasher,
            tokenGenerator,
        );
    });

    it('should register a user successfully', async () => {
        const hashed = 'hashed-password';
        passwordHasher.hash.mockResolvedValue(hashed);
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.save.mockImplementation(async (user) => user);

        const result = await service.register({
            email: 'user@example.com',
            password: 'Password123',
            nickname: 'tester',
        });

        expect(userRepository.findByEmail).toHaveBeenCalledWith(
            'user@example.com',
        );
        expect(passwordHasher.hash).toHaveBeenCalledWith('Password123');
        expect(userRepository.save).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(User);
        expect(result.getEmail()).toBe('user@example.com');
        expect(result.getHashedPassword()).toBe(hashed);
    });

    it('should throw when email already exists', async () => {
        const existing = User.create({
            id: 'id-1',
            email: 'user@example.com',
            hashedPassword: 'hashed',
            nickname: 'tester',
        });
        userRepository.findByEmail.mockResolvedValue(existing);

        await expect(
            service.register({
                email: 'user@example.com',
                password: 'Password123',
                nickname: 'tester',
            }),
        ).rejects.toBeInstanceOf(DuplicateEmailError);
    });

    it('should validate email format', async () => {
        await expect(
            service.register({
                email: 'invalid-email',
                password: 'Password123',
                nickname: 'tester',
            }),
        ).rejects.toBeInstanceOf(InvalidEmailFormatError);
    });

    it('should validate password strength', async () => {
        await expect(
            service.register({
                email: 'user@example.com',
                password: 'weak',
                nickname: 'tester',
            }),
        ).rejects.toBeInstanceOf(WeakPasswordError);
    });

    describe('login', () => {
        it('should login successfully and return token', async () => {
            const user = User.create({
                id: 'id-1',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'tester',
            });
            userRepository.findByEmail.mockResolvedValue(user);
            passwordHasher.verify.mockResolvedValue(true);
            tokenGenerator.generate.mockReturnValue('token');

            const result = await service.login({
                email: 'user@example.com',
                password: 'Password123',
            });

            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                'user@example.com',
            );
            expect(passwordHasher.verify).toHaveBeenCalledWith(
                'Password123',
                'hashed',
            );
            expect(tokenGenerator.generate).toHaveBeenCalledWith({
                userId: 'id-1',
                email: 'user@example.com',
            });
            expect(result.user).toBe(user);
            expect(result.token).toBe('token');
        });

        it('should throw invalid credentials when user not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                service.login({
                    email: 'missing@example.com',
                    password: 'Password123',
                }),
            ).rejects.toBeInstanceOf(InvalidCredentialsError);

            expect(passwordHasher.verify).toHaveBeenCalled();
        });

        it('should throw invalid credentials when password does not match', async () => {
            const user = User.create({
                id: 'id-1',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'tester',
            });
            userRepository.findByEmail.mockResolvedValue(user);
            passwordHasher.verify.mockResolvedValue(false);

            await expect(
                service.login({
                    email: 'user@example.com',
                    password: 'wrong',
                }),
            ).rejects.toBeInstanceOf(InvalidCredentialsError);
        });
    });
});
