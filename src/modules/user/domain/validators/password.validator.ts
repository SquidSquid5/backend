import { WeakPasswordError } from '@user/domain/errors/user.errors';

export class PasswordValidator {
    // Placeholder policy: at least 8 chars, must contain letters and numbers.
    public static validate(password: string): void {
        if (typeof password !== 'string') {
            throw new WeakPasswordError();
        }

        const trimmed = password.trim();

        const hasMinimumLength = trimmed.length >= 8;
        const hasLetter = /[A-Za-z]/.test(trimmed);
        const hasNumber = /[0-9]/.test(trimmed);

        if (!hasMinimumLength || !hasLetter || !hasNumber) {
            throw new WeakPasswordError();
        }
    }
}
