import { Injectable } from '@nestjs/common';
import type { TokenBlacklist } from '@user/domain/ports/outbound/token.blacklist';

@Injectable()
export class InMemoryTokenBlacklist implements TokenBlacklist {
    private readonly blacklist: Map<string, Date> = new Map();

    public async add(token: string, expiresAt: Date): Promise<void> {
        this.blacklist.set(token, expiresAt);
    }

    public async isBlacklisted(token: string): Promise<boolean> {
        const expiresAt = this.blacklist.get(token);
        if (expiresAt === undefined) {
            return false;
        }

        if (expiresAt.getTime() <= Date.now()) {
            this.blacklist.delete(token);
            return false;
        }

        return true;
    }

    public cleanup(): void {
        const now = Date.now();
        this.blacklist.forEach((expiresAt, token) => {
            if (expiresAt.getTime() <= now) {
                this.blacklist.delete(token);
            }
        });
    }
}
