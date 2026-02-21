import { InMemoryUserRepository } from './in-memory-user.repository';
import { User } from '@user/domain/entities/user.entity';

describe('InMemoryUserRepository', () => {
    it('should save and find by email', async () => {
        const repository = new InMemoryUserRepository();
        const user = User.create({
            id: 'id-1',
            email: 'user@example.com',
            hashedPassword: 'hashed',
            nickname: 'tester',
        });

        await repository.save(user);
        const found = await repository.findByEmail('user@example.com');

        expect(found).toBe(user);
    });

    it('should return null when user not found', async () => {
        const repository = new InMemoryUserRepository();
        const found = await repository.findByEmail('missing@example.com');
        expect(found).toBeNull();
    });

    describe('findById', () => {
        it('should find user by id', async () => {
            const repository = new InMemoryUserRepository();
            const user = User.create({
                id: 'user-id-123',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'tester',
            });

            await repository.save(user);
            const found = await repository.findById('user-id-123');

            expect(found).toBe(user);
            expect(found?.getId()).toBe('user-id-123');
        });

        it('should return null when user not found by id', async () => {
            const repository = new InMemoryUserRepository();
            const found = await repository.findById('non-existent-id');
            expect(found).toBeNull();
        });
    });
});
