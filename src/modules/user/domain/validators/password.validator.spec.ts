import { PasswordValidator } from './password.validator';
import { WeakPasswordError } from '../errors/user.errors';

describe('PasswordValidator', () => {
    it('should pass for a strong password', () => {
        expect(() => PasswordValidator.validate('Password123')).not.toThrow();
    });

    it('should throw for too short password', () => {
        expect(() => PasswordValidator.validate('Pw1')).toThrow(
            WeakPasswordError,
        );
    });

    it('should throw when missing number', () => {
        expect(() => PasswordValidator.validate('Password')).toThrow(
            WeakPasswordError,
        );
    });

    it('should throw when missing letter', () => {
        expect(() => PasswordValidator.validate('12345678')).toThrow(
            WeakPasswordError,
        );
    });
});
