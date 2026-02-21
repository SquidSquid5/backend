import { type UserPublicInfo } from '@user/domain/entities/user.entity';

export class GetMyInfoResponseDto {
    userId: string;
    email: string;
    nickname: string;
    createdAt: string;

    constructor(publicInfo: UserPublicInfo) {
        this.userId = publicInfo.id;
        this.email = publicInfo.email;
        this.nickname = publicInfo.nickname;
        this.createdAt = publicInfo.createdAt.toISOString();
    }
}
