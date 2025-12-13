import { isEmail } from 'class-validator';
import { InvalidEmailFormatError } from '@user/domain/errors/user.errors';

export class EmailValidator {
    public static validate(email: string): void {
        if (isEmail(email) === false) {
            throw new InvalidEmailFormatError(email);
        }
    }
}
