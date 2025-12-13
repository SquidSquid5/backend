import jwt from 'jsonwebtoken';
import { JwtTokenGenerator } from './jwt-token.generator';

describe('JwtTokenGenerator', () => {
    const secret = 'test-secret';

    it('should generate a signed JWT with payload and 1h expiry', () => {
        const generator = new JwtTokenGenerator(secret);
        const token = generator.generate({
            userId: 'user-1',
            email: 'user@example.com',
        });

        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
        expect(decoded.userId).toBe('user-1');
        expect(decoded.email).toBe('user@example.com');
        expect(decoded.exp).toBeDefined();
        expect(decoded.iat).toBeDefined();

        const expiresInSeconds = (decoded.exp ?? 0) - (decoded.iat ?? 0);
        // allow small drift around 3600s
        expect(expiresInSeconds).toBeGreaterThanOrEqual(3590);
        expect(expiresInSeconds).toBeLessThanOrEqual(3610);
    });
});
