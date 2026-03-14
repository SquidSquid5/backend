import { Module } from '@nestjs/common';
import { ChatGateway } from '@chat/presentation/chat.gateway';
import { ChatService } from '@chat/usecase/chat.service';
import { InMemoryMessageRepository } from '@chat/infrastructure/repositories/in-memory-message.repository';
import { MESSAGE_REPOSITORY } from '@chat/domain/ports/outbound/message.repository';
import { MESSAGE_BROADCASTER } from '@chat/domain/ports/outbound/message.broadcaster';
import { CHAT_USE_CASE } from '@chat/domain/ports/inbound/chat.usecase';
import { UserModule } from '@user/user.module';

@Module({
    imports: [UserModule],
    controllers: [],
    providers: [
        {
            provide: MESSAGE_REPOSITORY,
            useClass: InMemoryMessageRepository,
        },
        {
            provide: CHAT_USE_CASE,
            useClass: ChatService,
        },
        ChatGateway,
        {
            provide: MESSAGE_BROADCASTER,
            useExisting: ChatGateway,
        },
        {
            provide: 'JWT_SECRET',
            useValue: process.env.JWT_SECRET ?? 'dev-secret',
        },
    ],
    exports: [CHAT_USE_CASE, MESSAGE_REPOSITORY],
})
export class ChatModule {}
