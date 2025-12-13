import { UserService } from './user.service';
import { User } from '@user/domain/entities/user.entity';
import {
    DuplicateEmailError,
    InvalidEmailFormatError,
    WeakPasswordError,
} from '@user/domain/errors/user.errors';
import type { UserRepository } from '@user/domain/ports/outbound/user.repository';
import type { PasswordHasher } from '@user/domain/ports/outbound/password.hasher';

describe('UserService', () => {
    let userRepository: jest.Mocked<UserRepository>;
    let passwordHasher: jest.Mocked<PasswordHasher>;
    let service: UserService;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            save: jest.fn(),
        };
        passwordHasher = {
            hash: jest.fn(),
        };
        service = new UserService(userRepository, passwordHasher);
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
});
