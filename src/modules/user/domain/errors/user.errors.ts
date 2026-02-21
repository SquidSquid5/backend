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

export class InvalidCredentialsError extends PolicyError {
    constructor() {
        super(
            ErrorCodes.USER_INVALID_CREDENTIALS,
            '이메일 또는 비밀번호가 올바르지 않습니다.',
            undefined,
            401,
        );
    }
}

export class UnauthorizedError extends PolicyError {
    constructor() {
        super(
            ErrorCodes.USER_UNAUTHORIZED,
            '인증 정보가 없거나 유효하지 않습니다.',
            undefined,
            401,
        );
    }
}

export class TokenExpiredError extends PolicyError {
    constructor() {
        super(
            ErrorCodes.USER_TOKEN_EXPIRED,
            '토큰이 만료되었습니다.',
            undefined,
            401,
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

export class TokenGenerationFailedError extends InfrastructureError {
    constructor(cause?: unknown) {
        super(
            ErrorCodes.INFRA_TOKEN_GENERATION_FAILED,
            '토큰 생성에 실패했습니다.',
            cause,
        );
    }
}

export class BlacklistFailedError extends InfrastructureError {
    constructor(cause?: unknown) {
        super(
            ErrorCodes.INFRA_BLACKLIST_FAILED,
            '로그아웃 처리에 실패했습니다.',
            cause,
        );
    }
}

export class UserNotFoundError extends PolicyError {
    constructor(userId: string) {
        super(
            ErrorCodes.USER_NOT_FOUND,
            '사용자를 찾을 수 없습니다.',
            userId,
            404,
        );
    }
}
