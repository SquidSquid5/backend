import { User } from './user.entity';

describe('User Entity', () => {
    it('should create a user with provided fields', () => {
        const user = User.create({
            id: 'user-id',
            email: 'user@example.com',
            hashedPassword: 'hashed',
            nickname: 'tester',
        });

        expect(user.getId()).toBe('user-id');
        expect(user.getEmail()).toBe('user@example.com');
        expect(user.getHashedPassword()).toBe('hashed');
        expect(user.getNickname()).toBe('tester');
        expect(user.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should throw when id is empty', () => {
        expect(() =>
            User.create({
                id: '',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'tester',
            }),
        ).toThrow();
    });

    describe('toPublicInfo', () => {
        it('should return public info without hashedPassword', () => {
            const user = User.create({
                id: 'user-id',
                email: 'user@example.com',
                hashedPassword: 'hashed-secret',
                nickname: 'tester',
            });

            const publicInfo = user.toPublicInfo();

            expect(publicInfo.id).toBe('user-id');
            expect(publicInfo.email).toBe('user@example.com');
            expect(publicInfo.nickname).toBe('tester');
            expect(publicInfo.createdAt).toBeInstanceOf(Date);
            expect(publicInfo).not.toHaveProperty('hashedPassword');
        });
    });

    describe('update', () => {
        it('should update only provided fields', () => {
            const user = User.create({
                id: 'user-id',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'original',
            });

            const updated = user.update({ nickname: 'changed' });

            expect(updated.getNickname()).toBe('changed');
            expect(updated.getEmail()).toBe('user@example.com');
            expect(updated.getHashedPassword()).toBe('hashed');
        });

        it('should keep existing values when fields are not provided', () => {
            const user = User.create({
                id: 'user-id',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'original',
                profileImage: 'https://example.com/img.jpg',
            });

            const updated = user.update({});

            expect(updated.getNickname()).toBe('original');
            expect(updated.getProfileImage()).toBe(
                'https://example.com/img.jpg',
            );
            expect(updated.getHashedPassword()).toBe('hashed');
        });

        it('should set updatedAt automatically', () => {
            const user = User.create({
                id: 'user-id',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'original',
            });

            const before = new Date();
            const updated = user.update({ nickname: 'changed' });

            expect(updated.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
                before.getTime(),
            );
        });

        it('should return a new instance (immutability)', () => {
            const user = User.create({
                id: 'user-id',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'original',
            });

            const updated = user.update({ nickname: 'changed' });

            expect(updated).not.toBe(user);
            expect(user.getNickname()).toBe('original');
        });
    });
});
