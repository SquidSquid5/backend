import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { Message } from '@chat/domain/entities/message.entity';
import type { MessageBroadcaster } from '@chat/domain/ports/outbound/message.broadcaster';
import {
    CHAT_USE_CASE,
    type ChatUseCase,
} from '@chat/domain/ports/inbound/chat.usecase';
import {
    EmptyMessageContentError,
    MessageContentTooLongError,
} from '@chat/domain/errors/chat.errors';
import {
    USER_REPOSITORY,
    type UserRepository,
} from '@user/domain/ports/outbound/user.repository';

interface SendMessageDto {
    roomId: string;
    content: string;
}

interface ClientUserContext {
    userId: string;
    nickname: string;
}

interface JwtAuthPayload extends jwt.JwtPayload {
    userId: string;
}

@WebSocketGateway({
    namespace: '/ws',
    cors: {
        origin: '*',
    },
})
export class ChatGateway
    implements
        MessageBroadcaster,
        OnGatewayInit,
        OnGatewayConnection,
        OnGatewayDisconnect
{
    @WebSocketServer()
    private server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        @Inject(forwardRef(() => CHAT_USE_CASE))
        private readonly chatUseCase: ChatUseCase,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject('JWT_SECRET')
        private readonly jwtSecret: string,
    ) {}

    public afterInit(server: Server): void {
        server.use((socket, next) => {
            void this.authenticateSocket(socket)
                .then(() => next())
                .catch(() => next(new Error('UNAUTHORIZED')));
        });
    }

    public handleConnection(client: Socket): void {
        const user = this.getClientUserContext(client);
        this.logger.log(`Client connected: ${client.id}, userId=${user.userId}`);
    }

    public handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('message.send')
    public async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: SendMessageDto,
    ): Promise<void> {
        const roomId = this.normalizeRoomId(dto.roomId);
        if (roomId === null) {
            this.emitError(client, 'INVALID_INPUT', '입력 데이터 형식 오류');
            return;
        }

        const user = this.getClientUserContext(client);

        try {
            await this.chatUseCase.sendMessage({
                roomId,
                userId: user.userId,
                nickname: user.nickname,
                content: dto.content,
            });
        } catch (error) {
            if (error instanceof EmptyMessageContentError) {
                this.emitError(
                    client,
                    'EMPTY_MESSAGE',
                    '빈 메시지는 전송할 수 없습니다.',
                );
                return;
            }

            if (error instanceof MessageContentTooLongError) {
                this.emitError(
                    client,
                    'MESSAGE_TOO_LONG',
                    '메시지 길이가 허용 범위를 초과했습니다.',
                );
                return;
            }

            const stack =
                error instanceof Error ? error.stack : JSON.stringify(error);
            this.logger.error('Failed to send message', stack);
            this.emitError(
                client,
                'MESSAGE_SEND_FAILED',
                '메시지 전송에 실패했습니다.',
            );
        }
    }

    public async broadcast(roomId: string, message: Message): Promise<void> {
        this.server.to(roomId).emit('message.receive', {
            messageId: message.getMessageId(),
            roomId: message.getRoomId(),
            userId: message.getUserId(),
            nickname: message.getNickname(),
            content: message.getContent(),
            createdAt: message.getCreatedAt().toISOString(),
        });
    }

    private async authenticateSocket(socket: Socket): Promise<void> {
        const token = this.extractToken(socket);
        const payload = this.verifyToken(token);
        const user = await this.userRepository.findById(payload.userId);
        if (user === null) {
            throw new Error('UNAUTHORIZED');
        }

        socket.data.userId = user.getId();
        socket.data.nickname = user.getNickname();
    }

    private extractToken(socket: Socket): string {
        const { token } = socket.handshake.query;
        const raw = Array.isArray(token) ? token[0] : token;

        if (typeof raw !== 'string' || raw.trim().length === 0) {
            throw new Error('UNAUTHORIZED');
        }

        return raw;
    }

    private verifyToken(token: string): JwtAuthPayload {
        const decoded = jwt.verify(token, this.jwtSecret);
        if (typeof decoded !== 'object' || decoded === null) {
            throw new Error('UNAUTHORIZED');
        }

        const payload = decoded as JwtAuthPayload;
        if (typeof payload.userId !== 'string' || payload.userId.length === 0) {
            throw new Error('UNAUTHORIZED');
        }

        return payload;
    }

    private getClientUserContext(client: Socket): ClientUserContext {
        const userId = client.data.userId;
        const nickname = client.data.nickname;

        if (
            typeof userId !== 'string' ||
            userId.length === 0 ||
            typeof nickname !== 'string' ||
            nickname.length === 0
        ) {
            throw new Error('UNAUTHORIZED');
        }

        return { userId, nickname };
    }

    private normalizeRoomId(roomId: string | undefined): string | null {
        if (typeof roomId !== 'string') {
            return null;
        }

        const trimmed = roomId.trim();
        return trimmed.length === 0 ? null : trimmed;
    }

    private emitError(client: Socket, errorCode: string, message: string): void {
        client.emit('error', { errorCode, message });
    }
}
