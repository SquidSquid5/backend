import { Injectable } from '@nestjs/common';
import { User } from '@user/domain/entities/user.entity';
import { type UserRepository } from '@user/domain/ports/outbound/user.repository';
import { SaveFailedError } from '@user/domain/errors/user.errors';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
    private readonly usersByEmail: Map<string, User> = new Map();

    public findByEmail(email: string): Promise<User | null> {
        const user = this.usersByEmail.get(email);
        return Promise.resolve(user ?? null);
    }

    public findById(id: string): Promise<User | null> {
        const user = Array.from(this.usersByEmail.values()).find(
            (u) => u.getId() === id,
        );
        return Promise.resolve(user ?? null);
    }

    public save(user: User): Promise<User> {
        try {
            this.usersByEmail.set(user.getEmail(), user);
            return Promise.resolve(user);
        } catch (error) {
            throw new SaveFailedError(error);
        }
    }
}
