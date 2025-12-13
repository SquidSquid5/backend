import { NicknameValidator } from './nickname.validator';
import { InvalidNicknameError } from '../errors/user.errors';

describe('NicknameValidator', () => {
    it('should pass for a valid nickname', () => {
        expect(() => NicknameValidator.validate('tester')).not.toThrow();
    });

    it('should throw for too short nickname', () => {
        expect(() => NicknameValidator.validate('a')).toThrow(
            InvalidNicknameError,
        );
    });

    it('should throw for too long nickname', () => {
        expect(() => NicknameValidator.validate('a'.repeat(31))).toThrow(
            InvalidNicknameError,
        );
    });
});
