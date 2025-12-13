import { BcryptPasswordHasher } from './bcrypt-password.hasher';

describe('BcryptPasswordHasher', () => {
    it('should hash password with bcrypt', async () => {
        const hasher = new BcryptPasswordHasher();
        const result = await hasher.hash('Password123');

        expect(result).toBeDefined();
        expect(result).not.toEqual('Password123');
        expect(result.startsWith('$2')).toBe(true);
    });
});
