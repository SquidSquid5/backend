import { InMemoryMessageRepository } from './in-memory-message.repository';
import { Message } from '@chat/domain/entities/message.entity';

describe('InMemoryMessageRepository', () => {
    let repository: InMemoryMessageRepository;

    beforeEach(() => {
        repository = new InMemoryMessageRepository();
    });

    it('should save and find a message by id', async () => {
        const message = Message.create({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'Hello',
        });

        await repository.save(message);
        const found = await repository.findById('msg-1');

        expect(found).toBe(message);
    });

    it('should return null for non-existent message', async () => {
        const found = await repository.findById('non-existent');

        expect(found).toBeNull();
    });

    it('should find messages by roomId', async () => {
        const msg1 = Message.create({
            messageId: 'msg-1',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'First',
        });
        const msg2 = Message.create({
            messageId: 'msg-2',
            roomId: 'room-1',
            userId: 'user-2',
            nickname: 'user-two',
            content: 'Second',
        });
        const msg3 = Message.create({
            messageId: 'msg-3',
            roomId: 'room-2',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'Other room',
        });

        await repository.save(msg1);
        await repository.save(msg2);
        await repository.save(msg3);

        const messages = await repository.findByRoomId('room-1');

        expect(messages).toHaveLength(2);
        expect(messages[0].getMessageId()).toBe('msg-1');
        expect(messages[1].getMessageId()).toBe('msg-2');
    });

    it('should return empty array for room with no messages', async () => {
        const messages = await repository.findByRoomId('empty-room');

        expect(messages).toEqual([]);
    });

    it('should return messages sorted by timestamp', async () => {
        const older = Message.reconstitute({
            messageId: 'msg-old',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'Older',
            createdAt: new Date('2025-01-01T00:00:00Z'),
        });
        const newer = Message.reconstitute({
            messageId: 'msg-new',
            roomId: 'room-1',
            userId: 'user-1',
            nickname: 'user-one',
            content: 'Newer',
            createdAt: new Date('2025-01-02T00:00:00Z'),
        });

        await repository.save(newer);
        await repository.save(older);

        const messages = await repository.findByRoomId('room-1');

        expect(messages[0].getMessageId()).toBe('msg-old');
        expect(messages[1].getMessageId()).toBe('msg-new');
    });
});
