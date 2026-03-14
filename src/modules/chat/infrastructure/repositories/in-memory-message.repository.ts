import { Injectable } from '@nestjs/common';
import { Message } from '@chat/domain/entities/message.entity';
import { MessageRepository } from '@chat/domain/ports/outbound/message.repository';

@Injectable()
export class InMemoryMessageRepository implements MessageRepository {
    private messages: Map<string, Message> = new Map();

    public save(message: Message): Promise<void> {
        this.messages.set(message.getMessageId(), message);
        return Promise.resolve();
    }

    public findByRoomId(roomId: string): Promise<Message[]> {
        const messagesInRoom: Message[] = [];

        this.messages.forEach((message) => {
            if (message.getRoomId() === roomId) {
                messagesInRoom.push(message);
            }
        });

        const sorted = messagesInRoom.sort(
            (a, b) => a.getCreatedAt().getTime() - b.getCreatedAt().getTime(),
        );

        return Promise.resolve(sorted);
    }

    public findById(messageId: string): Promise<Message | null> {
        const message = this.messages.get(messageId);
        return Promise.resolve(message !== undefined ? message : null);
    }
}
