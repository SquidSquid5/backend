import { BcryptPasswordHasher } from './bcrypt-password.hasher';

describe('BcryptPasswordHasher', () => {
    it('should hash password with bcrypt', async () => {
        const hasher = new BcryptPasswordHasher();
        const result = await hasher.hash('Password123');

        expect(result).toBeDefined();
        expect(result).not.toEqual('Password123');
        expect(result.startsWith('$2')).toBe(true);
    });

    it('should verify matching password', async () => {
        const hasher = new BcryptPasswordHasher();
        const hashed = await hasher.hash('Password123');

        await expect(hasher.verify('Password123', hashed)).resolves.toBe(true);
    });

    it('should return false for non-matching password', async () => {
        const hasher = new BcryptPasswordHasher();
        const hashed = await hasher.hash('Password123');

        await expect(hasher.verify('WrongPass', hashed)).resolves.toBe(false);
    });
});
