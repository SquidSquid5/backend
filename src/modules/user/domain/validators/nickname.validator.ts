import { InvalidNicknameError } from '@user/domain/errors/user.errors';

export class NicknameValidator {
    // Placeholder policy: 2~30 chars, non-empty when trimmed.
    public static validate(nickname: string): void {
        if (typeof nickname !== 'string') {
            throw new InvalidNicknameError();
        }

        const trimmed = nickname.trim();
        if (trimmed.length < 2 || trimmed.length > 30) {
            throw new InvalidNicknameError();
        }
    }
}
