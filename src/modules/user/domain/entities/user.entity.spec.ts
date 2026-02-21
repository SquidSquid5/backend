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
});
