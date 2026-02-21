import { User } from '@user/domain/entities/user.entity';

export class UpdateMyInfoResponseDto {
    userId: string;
    email: string;
    nickname: string;
    profileImage?: string;
    updatedAt: string;

    constructor(user: User) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.updatedAt = user.getUpdatedAt().toISOString();
    }
}
