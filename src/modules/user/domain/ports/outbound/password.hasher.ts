export interface PasswordHasher {
    hash(plainPassword: string): Promise<string>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
