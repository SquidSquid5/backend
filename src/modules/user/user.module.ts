import { Module } from '@nestjs/common';
import { UsersController } from '@user/presentation/users.controller';
import { InMemoryUserRepository } from '@user/infrastructure/repositories/in-memory-user.repository';
import { BcryptPasswordHasher } from '@user/infrastructure/security/bcrypt-password.hasher';
import { USER_REPOSITORY } from '@user/domain/ports/outbound/user.repository';
import { PASSWORD_HASHER } from '@user/domain/ports/outbound/password.hasher';
import { TOKEN_GENERATOR } from '@user/domain/ports/outbound/token.generator';
import { TOKEN_BLACKLIST } from '@user/domain/ports/outbound/token.blacklist';
import { USER_USE_CASE } from '@user/domain/ports/inbound/user.usecase';
import { UserService } from '@user/usecase/user.service';
import { JwtTokenGenerator } from '@user/infrastructure/security/jwt-token.generator';
import { InMemoryTokenBlacklist } from '@user/infrastructure/security/in-memory-token.blacklist';

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
            provide: TOKEN_GENERATOR,
            useClass: JwtTokenGenerator,
        },
        {
            provide: TOKEN_BLACKLIST,
            useClass: InMemoryTokenBlacklist,
        },
        {
            provide: USER_USE_CASE,
            useClass: UserService,
        },
        {
            provide: 'JWT_SECRET',
            useValue: process.env.JWT_SECRET ?? 'dev-secret',
        },
    ],
    exports: [USER_USE_CASE, USER_REPOSITORY],
})
export class UserModule {}
