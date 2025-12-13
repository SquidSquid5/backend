export interface TokenPayload {
    userId: string;
    email: string;
}

export interface TokenGenerator {
    generate(payload: TokenPayload): string;
}

export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');
