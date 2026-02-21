import { IsOptional, IsString } from 'class-validator';

export class UpdateMyInfoRequestDto {
    @IsString({ message: '닉네임은 문자열이어야 합니다.' })
    @IsOptional()
    public nickname?: string;

    @IsString({ message: '프로필 이미지는 문자열이어야 합니다.' })
    @IsOptional()
    public profileImage?: string;

    @IsString({ message: '현재 비밀번호는 문자열이어야 합니다.' })
    @IsOptional()
    public currentPassword?: string;

    @IsString({ message: '새 비밀번호는 문자열이어야 합니다.' })
    @IsOptional()
    public newPassword?: string;
}
