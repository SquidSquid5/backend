import jwt from 'jsonwebtoken';
import { ChatGateway } from './chat.gateway';
import { Message } from '@chat/domain/entities/message.entity';
import {
    EmptyMessageContentError,
    MessageContentTooLongError,
} from '@chat/domain/errors/chat.errors';
import type { ChatUseCase } from '@chat/domain/ports/inbound/chat.usecase';
import type { UserRepository } from '@user/domain/ports/outbound/user.repository';
import { User } from '@user/domain/entities/user.entity';

describe('ChatGateway', () => {
    let chatUseCase: jest.Mocked<ChatUseCase>;
    let userRepository: jest.Mocked<UserRepository>;
    let gateway: ChatGateway;
    let to: jest.Mock;
    let emit: jest.Mock;
    const secret = 'dev-secret';

    const createClient = (overrides?: Record<string, unknown>) => ({
        id: 'client-1',
        emit: jest.fn(),
        handshake: { query: {} },
        data: {
            userId: 'user-1',
            nickname: 'user-one',
        },
        ...(overrides ?? {}),
    });

    beforeEach(() => {
        chatUseCase = {
            sendMessage: jest.fn(),
            getMessagesByRoom: jest.fn(),
        };
        userRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
        };
        gateway = new ChatGateway(chatUseCase, userRepository, secret);

        emit = jest.fn();
        to = jest.fn().mockReturnValue({ emit });
        (gateway as any).server = { to };
    });

    describe('afterInit', () => {
        it('should reject connection when token is missing', async () => {
            let middleware:
                | ((socket: unknown, next: (error?: Error) => void) => void)
                | undefined;
            const server = {
                use: jest.fn((fn) => {
                    middleware = fn;
                }),
            };

            gateway.afterInit(server as never);

            const next = jest.fn();
            middleware?.(createClient({ data: {} }) as never, next);
            await Promise.resolve();
            await Promise.resolve();

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should authenticate socket and store user context', async () => {
            const token = jwt.sign({ userId: 'user-1' }, secret, {
                expiresIn: '1h',
            });
            const user = User.create({
                id: 'user-1',
                email: 'user@example.com',
                hashedPassword: 'hashed',
                nickname: 'user-one',
            });
            userRepository.findById.mockResolvedValue(user);

            let middleware:
                | ((socket: unknown, next: (error?: Error) => void) => void)
                | undefined;
            const server = {
                use: jest.fn((fn) => {
                    middleware = fn;
                }),
            };
            gateway.afterInit(server as never);

            const socket = createClient({
                handshake: { query: { token } },
                data: {},
            });
            const next = jest.fn();
            middleware?.(socket as never, next);
            await Promise.resolve();
            await Promise.resolve();

            expect(next).toHaveBeenCalledWith();
            expect(socket.data.userId).toBe('user-1');
            expect(socket.data.nickname).toBe('user-one');
        });
    });

    it('should forward message.send payload to use case', async () => {
        const client = createClient();
        const saved = Message.create({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'hello',
        });
        chatUseCase.sendMessage.mockResolvedValue(saved);

        await gateway.handleMessage(client as never, {
            roomId: 'room-1',
            content: 'hello',
        });

        expect(chatUseCase.sendMessage).toHaveBeenCalledWith({
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'hello',
        });
    });

    it('should emit EMPTY_MESSAGE when message is empty', async () => {
        const client = createClient();
        chatUseCase.sendMessage.mockRejectedValue(new EmptyMessageContentError());

        await gateway.handleMessage(client as never, {
            roomId: 'room-1',
            content: '   ',
        });

        expect(client.emit).toHaveBeenCalledWith('error', {
            errorCode: 'EMPTY_MESSAGE',
            message: '빈 메시지는 전송할 수 없습니다.',
        });
    });

    it('should emit MESSAGE_TOO_LONG when message exceeds limit', async () => {
        const client = createClient();
        chatUseCase.sendMessage.mockRejectedValue(
            new MessageContentTooLongError(1001),
        );

        await gateway.handleMessage(client as never, {
            roomId: 'room-1',
            content: 'a'.repeat(1001),
        });

        expect(client.emit).toHaveBeenCalledWith('error', {
            errorCode: 'MESSAGE_TOO_LONG',
            message: '메시지 길이가 허용 범위를 초과했습니다.',
        });
    });

    it('should emit MESSAGE_SEND_FAILED for unexpected error', async () => {
        const client = createClient();
        chatUseCase.sendMessage.mockRejectedValue(new Error('unexpected'));

        await gateway.handleMessage(client as never, {
            roomId: 'room-1',
            content: 'hello',
        });

        expect(client.emit).toHaveBeenCalledWith('error', {
            errorCode: 'MESSAGE_SEND_FAILED',
            message: '메시지 전송에 실패했습니다.',
        });
    });

    it('should emit message.receive on broadcast', async () => {
        const message = Message.reconstitute({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'hello',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
        });

        await gateway.broadcast('room-1', message);

        expect(to).toHaveBeenCalledWith('room-1');
        expect(emit).toHaveBeenCalledWith('message.receive', {
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'hello',
            createdAt: '2025-01-01T00:00:00.000Z',
        });
    });
});
