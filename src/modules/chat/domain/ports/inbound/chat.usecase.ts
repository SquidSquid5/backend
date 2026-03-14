import { Message } from '@chat/domain/entities/message.entity';

export interface SendMessageCommand {
    roomId: string;
    userId: string;
    nickname: string;
    content: string;
}

export interface ChatUseCase {
    sendMessage(command: SendMessageCommand): Promise<Message>;
    getMessagesByRoom(roomId: string): Promise<Message[]>;
}

export const CHAT_USE_CASE = Symbol('CHAT_USE_CASE');
