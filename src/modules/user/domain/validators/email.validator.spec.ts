import { EmailValidator } from './email.validator';
import { InvalidEmailFormatError } from '../errors/user.errors';

describe('EmailValidator', () => {
    it('should pass for a valid email', () => {
        expect(() => EmailValidator.validate('test@example.com')).not.toThrow();
    });

    it('should throw for an invalid email', () => {
        expect(() => EmailValidator.validate('invalid-email')).toThrow(
            InvalidEmailFormatError,
        );
    });
});
