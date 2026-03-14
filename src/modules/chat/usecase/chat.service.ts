import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Message } from '@chat/domain/entities/message.entity';
import { MessageSendFailedError } from '@chat/domain/errors/chat.errors';
import {
    MESSAGE_REPOSITORY,
    type MessageRepository,
} from '@chat/domain/ports/outbound/message.repository';
import {
    MESSAGE_BROADCASTER,
    type MessageBroadcaster,
} from '@chat/domain/ports/outbound/message.broadcaster';
import {
    type ChatUseCase,
    type SendMessageCommand,
} from '@chat/domain/ports/inbound/chat.usecase';

@Injectable()
export class ChatService implements ChatUseCase {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: MessageRepository,
        @Inject(forwardRef(() => MESSAGE_BROADCASTER))
        private readonly messageBroadcaster: MessageBroadcaster,
    ) {}

    public async sendMessage(command: SendMessageCommand): Promise<Message> {
        const message = Message.create({
            messageId: randomUUID(),
            roomId: command.roomId,
            userId: command.userId,
            nickname: command.nickname,
            content: command.content,
        });

        try {
            await this.messageRepository.save(message);
            await this.messageBroadcaster.broadcast(command.roomId, message);
        } catch (error) {
            throw new MessageSendFailedError(error);
        }

        this.logger.log(
            `Message sent in room ${command.roomId} by user ${command.userId}`,
        );
        return message;
    }

    public async getMessagesByRoom(roomId: string): Promise<Message[]> {
        return this.messageRepository.findByRoomId(roomId);
    }
}
