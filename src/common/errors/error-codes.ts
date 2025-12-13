export const ErrorCodes = {
    USER_INVALID_EMAIL_FORMAT: 'USER_INVALID_EMAIL_FORMAT',
    USER_WEAK_PASSWORD: 'USER_WEAK_PASSWORD',
    USER_INVALID_NICKNAME: 'USER_INVALID_NICKNAME',
    USER_DUPLICATE_EMAIL: 'USER_DUPLICATE_EMAIL',
    INFRA_HASH_FAILED: 'INFRA_HASH_FAILED',
    INFRA_SAVE_FAILED: 'INFRA_SAVE_FAILED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function stripErrorPrefix(code: string): string {
    if (code.startsWith('USER_')) {
        return code.replace(/^USER_/, '');
    }

    if (code.startsWith('INFRA_')) {
        return code.replace(/^INFRA_/, '');
    }

    return code;
}
