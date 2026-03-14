import {
    EmptyMessageContentError,
    MessageContentTooLongError,
} from '@chat/domain/errors/chat.errors';

export class Message {
    private readonly messageId: string;
    private readonly roomId: string;
    private readonly userId: string;
    private readonly nickname: string;
    private readonly content: string;
    private readonly createdAt: Date;

    private constructor(params: {
        messageId: string;
        roomId: string;
        userId: string;
        nickname: string;
        content: string;
        createdAt?: Date;
    }) {
        this.assertString(params.messageId, 'Message messageId');
        this.assertString(params.roomId, 'Message roomId');
        this.assertString(params.userId, 'Message userId');
        this.assertString(params.nickname, 'Message nickname');
        this.validateContent(params.content);

        this.messageId = params.messageId;
        this.roomId = params.roomId;
        this.userId = params.userId;
        this.nickname = params.nickname;
        this.content = params.content;
        this.createdAt = params.createdAt ?? new Date();
    }

    public static create(params: {
        messageId: string;
        roomId: string;
        userId: string;
        nickname: string;
        content: string;
    }): Message {
        return new Message(params);
    }

    public static reconstitute(params: {
        messageId: string;
        roomId: string;
        userId: string;
        nickname: string;
        content: string;
        createdAt: Date;
    }): Message {
        return new Message(params);
    }

    public getMessageId(): string {
        return this.messageId;
    }

    public getRoomId(): string {
        return this.roomId;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getNickname(): string {
        return this.nickname;
    }

    public getContent(): string {
        return this.content;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public toPlainObject(): {
        messageId: string;
        roomId: string;
        userId: string;
        nickname: string;
        content: string;
        createdAt: string;
    } {
        return {
            messageId: this.messageId,
            roomId: this.roomId,
            userId: this.userId,
            nickname: this.nickname,
            content: this.content,
            createdAt: this.createdAt.toISOString(),
        };
    }

    private assertString(value: string, fieldName: string): void {
        if (
            value === undefined ||
            value === null ||
            value.trim().length === 0
        ) {
            throw new Error(`${fieldName} cannot be empty`);
        }
    }

    private validateContent(content: string): void {
        if (content === null || content === undefined) {
            throw new EmptyMessageContentError();
        }

        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) {
            throw new EmptyMessageContentError();
        }

        if (trimmedContent.length > 1000) {
            throw new MessageContentTooLongError(trimmedContent.length);
        }
    }
}
