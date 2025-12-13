export interface PasswordHasher {
    hash(plainPassword: string): Promise<string>;
    verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
