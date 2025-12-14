export interface TokenBlacklist {
    add(token: string, expiresAt: Date): Promise<void>;
    isBlacklisted(token: string): Promise<boolean>;
}

export const TOKEN_BLACKLIST = Symbol('TOKEN_BLACKLIST');
