import { InMemoryTokenBlacklist } from './in-memory-token.blacklist';

describe('InMemoryTokenBlacklist', () => {
    it('should add and detect blacklisted token', async () => {
        const blacklist = new InMemoryTokenBlacklist();
        const expiresAt = new Date(Date.now() + 1000);

        await blacklist.add('token', expiresAt);

        await expect(blacklist.isBlacklisted('token')).resolves.toBe(true);
    });

    it('should return false for non-existent token', async () => {
        const blacklist = new InMemoryTokenBlacklist();
        await expect(blacklist.isBlacklisted('missing')).resolves.toBe(false);
    });

    it('should remove expired token automatically', async () => {
        const blacklist = new InMemoryTokenBlacklist();
        const expiresAt = new Date(Date.now() - 1000);

        await blacklist.add('token', expiresAt);

        await expect(blacklist.isBlacklisted('token')).resolves.toBe(false);
    });
});
