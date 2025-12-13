import { ErrorCodes } from '@common/errors/error-codes';
import {
    DomainError,
    InfrastructureError,
    PolicyError,
} from '@common/errors/base.error';

export class InvalidEmailFormatError extends DomainError {
    constructor(email: string) {
        super(
            ErrorCodes.USER_INVALID_EMAIL_FORMAT,
            '유효하지 않은 이메일 형식입니다.',
            email,
        );
    }
}

export class WeakPasswordError extends DomainError {
    constructor() {
        super(
            ErrorCodes.USER_WEAK_PASSWORD,
            '비밀번호가 보안 요구사항을 충족하지 않습니다.',
        );
    }
}

export class InvalidNicknameError extends DomainError {
    constructor() {
        super(ErrorCodes.USER_INVALID_NICKNAME, '유효하지 않은 닉네임입니다.');
    }
}

export class DuplicateEmailError extends PolicyError {
    constructor(email: string) {
        super(
            ErrorCodes.USER_DUPLICATE_EMAIL,
            '이미 존재하는 이메일입니다.',
            email,
        );
    }
}

export class HashFailedError extends InfrastructureError {
    constructor(cause?: unknown) {
        super(
            ErrorCodes.INFRA_HASH_FAILED,
            '비밀번호 암호화에 실패했습니다.',
            cause,
        );
    }
}

export class SaveFailedError extends InfrastructureError {
    constructor(cause?: unknown) {
        super(
            ErrorCodes.INFRA_SAVE_FAILED,
            '사용자 저장에 실패했습니다.',
            cause,
        );
    }
}
