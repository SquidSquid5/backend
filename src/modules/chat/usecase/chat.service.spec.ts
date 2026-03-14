import { ChatService } from './chat.service';
import { Message } from '@chat/domain/entities/message.entity';
import {
    EmptyMessageContentError,
    MessageContentTooLongError,
    MessageSendFailedError,
} from '@chat/domain/errors/chat.errors';
import type { MessageRepository } from '@chat/domain/ports/outbound/message.repository';
import type { MessageBroadcaster } from '@chat/domain/ports/outbound/message.broadcaster';

describe('ChatService', () => {
    let messageRepository: jest.Mocked<MessageRepository>;
    let messageBroadcaster: jest.Mocked<MessageBroadcaster>;
    let service: ChatService;

    beforeEach(() => {
        messageRepository = {
            save: jest.fn(),
            findByRoomId: jest.fn(),
            findById: jest.fn(),
        };
        messageBroadcaster = {
            broadcast: jest.fn(),
        };
        service = new ChatService(messageRepository, messageBroadcaster);
    });

    describe('sendMessage', () => {
        it('should create, save and broadcast a message', async () => {
            const result = await service.sendMessage({
                roomId: 'room-1',
                userId: 'user-1',
                nickname: 'user-one',
                content: 'Hello',
            });

            expect(result).toBeInstanceOf(Message);
            expect(result.getRoomId()).toBe('room-1');
            expect(result.getUserId()).toBe('user-1');
            expect(result.getNickname()).toBe('user-one');
            expect(result.getContent()).toBe('Hello');
            expect(result.getMessageId()).toBeDefined();
            expect(messageRepository.save).toHaveBeenCalledWith(result);
            expect(messageBroadcaster.broadcast).toHaveBeenCalledWith(
                'room-1',
                result,
            );
        });

        it('should throw EmptyMessageContentError for empty content', async () => {
            await expect(
                service.sendMessage({
                    roomId: 'room-1',
                    userId: 'user-1',
                    nickname: 'user-one',
                    content: '',
                }),
            ).rejects.toBeInstanceOf(EmptyMessageContentError);
        });

        it('should throw MessageContentTooLongError for content over 1000 chars', async () => {
            await expect(
                service.sendMessage({
                    roomId: 'room-1',
                    userId: 'user-1',
                    nickname: 'user-one',
                    content: 'a'.repeat(1001),
                }),
            ).rejects.toBeInstanceOf(MessageContentTooLongError);
        });

        it('should throw MessageSendFailedError when repository fails', async () => {
            messageRepository.save.mockRejectedValue(new Error('save failed'));

            await expect(
                service.sendMessage({
                    roomId: 'room-1',
                    userId: 'user-1',
                    nickname: 'user-one',
                    content: 'Hello',
                }),
            ).rejects.toBeInstanceOf(MessageSendFailedError);
        });
    });

    describe('getMessagesByRoom', () => {
        it('should return messages from repository', async () => {
            const messages = [
                Message.create({
                    messageId: 'msg-1',
                    roomId: 'room-1',
                    userId: 'user-1',
                    nickname: 'user-one',
                    content: 'Hello',
                }),
            ];
            messageRepository.findByRoomId.mockResolvedValue(messages);

            const result = await service.getMessagesByRoom('room-1');

            expect(messageRepository.findByRoomId).toHaveBeenCalledWith(
                'room-1',
            );
            expect(result).toBe(messages);
        });

        it('should return empty array for room with no messages', async () => {
            messageRepository.findByRoomId.mockResolvedValue([]);

            const result = await service.getMessagesByRoom('empty-room');

            expect(result).toEqual([]);
        });
    });
});
