import { Message } from '@chat/domain/entities/message.entity';

export interface MessageBroadcaster {
    broadcast(roomId: string, message: Message): Promise<void>;
}

export const MESSAGE_BROADCASTER = Symbol('MESSAGE_BROADCASTER');
