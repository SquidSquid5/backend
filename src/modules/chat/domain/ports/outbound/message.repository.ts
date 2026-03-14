import { Message } from '@chat/domain/entities/message.entity';

export interface MessageRepository {
    save(message: Message): Promise<void>;
    findByRoomId(roomId: string): Promise<Message[]>;
    findById(messageId: string): Promise<Message | null>;
}

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');
