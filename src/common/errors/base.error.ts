import { stripErrorPrefix, type ErrorCode } from '@common/errors/error-codes';

export abstract class BaseError extends Error {
    public readonly code: ErrorCode;
    public readonly httpStatus: number;
    public readonly cause?: unknown;

    constructor(
        code: ErrorCode,
        message: string,
        httpStatus: number,
        cause?: unknown,
    ) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.httpStatus = httpStatus;
        this.cause = cause;

        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toClientCode(): string {
        return stripErrorPrefix(String(this.code));
    }
}

export abstract class DomainError extends BaseError {
    protected constructor(code: ErrorCode, message: string, cause?: unknown) {
        super(code, message, 400, cause);
    }
}

export abstract class PolicyError extends BaseError {
    protected constructor(code: ErrorCode, message: string, cause?: unknown) {
        super(code, message, 400, cause);
    }
}

export abstract class InfrastructureError extends BaseError {
    protected constructor(code: ErrorCode, message: string, cause?: unknown) {
        super(code, message, 500, cause);
    }
}
