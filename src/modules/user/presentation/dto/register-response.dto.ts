import { User } from '@user/domain/entities/user.entity';

export class RegisterResponseDto {
    public readonly userId: string;
    public readonly email: string;
    public readonly nickname: string;
    public readonly createdAt: string;

    constructor(user: User) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.createdAt = user.getCreatedAt().toISOString();
    }
}
