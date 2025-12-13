import { User } from '@user/domain/entities/user.entity';

export class LoginResponseDto {
    public readonly userId: string;
    public readonly token: string;
    public readonly nickname: string;

    constructor(user: User, token: string) {
        this.userId = user.getId();
        this.token = token;
        this.nickname = user.getNickname();
    }
}
