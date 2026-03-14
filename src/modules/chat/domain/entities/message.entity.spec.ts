import { Message } from './message.entity';
import {
    EmptyMessageContentError,
    MessageContentTooLongError,
} from '@chat/domain/errors/chat.errors';

describe('Message Entity', () => {
    it('should create a message with provided fields', () => {
        const message = Message.create({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'Hello',
        });

        expect(message.getMessageId()).toBe('msg-1');
        expect(message.getRoomId()).toBe('room-1');
        expect(message.getUserId()).toBe('user-1');
        expect(message.getNickname()).toBe('user-one');
        expect(message.getContent()).toBe('Hello');
        expect(message.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should reconstitute a message with createdAt', () => {
        const createdAt = new Date('2025-01-01T00:00:00Z');
        const message = Message.reconstitute({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'Hello',
            createdAt,
        });

        expect(message.getCreatedAt()).toBe(createdAt);
    });

    it('should throw when messageId is empty', () => {
        expect(() =>
            Message.create({
                messageId: '',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: 'Hello',
            }),
        ).toThrow();
    });

    it('should throw when roomId is empty', () => {
        expect(() =>
            Message.create({
                messageId: 'msg-1',
                roomId: '',
                userId: 'user-1',
                nickname: 'user-one',
                content: 'Hello',
            }),
        ).toThrow();
    });

    it('should throw when userId is empty', () => {
        expect(() =>
            Message.create({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: '',
                nickname: 'user-one',
                content: 'Hello',
            }),
        ).toThrow();
    });

    it('should throw when nickname is empty', () => {
        expect(() =>
            Message.create({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: '',
                content: 'Hello',
            }),
        ).toThrow();
    });

    it('should throw EmptyMessageContentError when content is empty', () => {
        expect(() =>
            Message.create({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: '',
            }),
        ).toThrow(EmptyMessageContentError);
    });

    it('should throw EmptyMessageContentError when content is whitespace only', () => {
        expect(() =>
            Message.create({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: '   ',
            }),
        ).toThrow(EmptyMessageContentError);
    });

    it('should throw MessageContentTooLongError when content exceeds 1000 chars', () => {
        const longContent = 'a'.repeat(1001);
        expect(() =>
            Message.create({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: longContent,
            }),
        ).toThrow(MessageContentTooLongError);
    });

    it('should allow content exactly 1000 chars', () => {
        const content = 'a'.repeat(1000);
        const message = Message.create({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content,
        });

        expect(message.getContent()).toBe(content);
    });

    describe('toPlainObject', () => {
        it('should return plain object with createdAt', () => {
            const createdAt = new Date('2025-01-01T00:00:00Z');
            const message = Message.reconstitute({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: 'Hello',
                createdAt,
            });

            const plain = message.toPlainObject();

            expect(plain).toEqual({
                messageId: 'msg-1',
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: 'Hello',
                createdAt: '2025-01-01T00:00:00.000Z',
            });
        });
    });
});
