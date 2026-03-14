import { ErrorCodes } from '@common/errors/error-codes';
import {
    DomainError,
    InfrastructureError,
    PolicyError,
} from '@common/errors/base.error';

export class EmptyMessageContentError extends DomainError {
    constructor() {
        super(ErrorCodes.CHAT_EMPTY_MESSAGE, '메시지 내용이 비어 있습니다.');
    }
}

export class MessageContentTooLongError extends DomainError {
    constructor(length: number) {
        super(
            ErrorCodes.CHAT_MESSAGE_TOO_LONG,
            '메시지 길이가 최대 허용 길이(1000자)를 초과했습니다.',
            length,
        );
    }
}

export class MessageSendFailedError extends InfrastructureError {
    constructor(cause?: unknown) {
        super(
            ErrorCodes.CHAT_MESSAGE_SEND_FAILED,
            '메시지 전송에 실패했습니다.',
            cause,
        );
    }
}

export class ChatRoomNotFoundError extends PolicyError {
    constructor(roomId: string) {
        super(
            ErrorCodes.CHAT_ROOM_NOT_FOUND,
            '방을 찾을 수 없습니다.',
            roomId,
            404,
        );
    }
}

export class NotParticipantError extends PolicyError {
    constructor(roomId: string) {
        super(
            ErrorCodes.CHAT_NOT_PARTICIPANT,
            '방 참여자가 아닙니다.',
            roomId,
            403,
        );
    }
}
