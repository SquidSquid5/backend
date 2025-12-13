import { Inject, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import {
    TokenGenerator,
    type TokenPayload,
} from '@user/domain/ports/outbound/token.generator';
import { TokenGenerationFailedError } from '@user/domain/errors/user.errors';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
    private readonly expiresIn = '1h';

    constructor(@Inject('JWT_SECRET') private readonly secret: string) {}

    public generate(payload: TokenPayload): string {
        try {
            return jwt.sign(
                {
                    userId: payload.userId,
                    email: payload.email,
                },
                this.secret,
                { expiresIn: this.expiresIn },
            );
        } catch (error) {
            throw new TokenGenerationFailedError(error);
        }
    }
}
