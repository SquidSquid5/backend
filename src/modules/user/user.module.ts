import { Module } from '@nestjs/common';
import { UsersController } from '@user/presentation/users.controller';
import { InMemoryUserRepository } from '@user/infrastructure/repositories/in-memory-user.repository';
import { BcryptPasswordHasher } from '@user/infrastructure/security/bcrypt-password.hasher';
import { USER_REPOSITORY } from '@user/domain/ports/outbound/user.repository';
import { PASSWORD_HASHER } from '@user/domain/ports/outbound/password.hasher';
import { USER_USE_CASE } from '@user/domain/ports/inbound/user.usecase';
import { UserService } from '@user/usecase/user.service';

@Module({
    controllers: [UsersController],
    providers: [
        {
            provide: USER_REPOSITORY,
            useClass: InMemoryUserRepository,
        },
        {
            provide: PASSWORD_HASHER,
            useClass: BcryptPasswordHasher,
        },
        {
            provide: USER_USE_CASE,
            useClass: UserService,
        },
    ],
    exports: [USER_USE_CASE, USER_REPOSITORY],
})
export class UserModule {}
