import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import {
    HashFailedError,
    WeakPasswordError,
} from '@user/domain/errors/user.errors';
import { type PasswordHasher } from '@user/domain/ports/outbound/password.hasher';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds = 10;

    public async hash(plainPassword: string): Promise<string> {
        if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
            throw new WeakPasswordError();
        }

        try {
            return await bcrypt.hash(plainPassword, this.saltRounds);
        } catch (error) {
            throw new HashFailedError(error);
        }
    }

    public async verify(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
            return false;
        }

        if (typeof hashedPassword !== 'string' || hashedPassword.length === 0) {
            return false;
        }

        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw new HashFailedError(error);
        }
    }
}
