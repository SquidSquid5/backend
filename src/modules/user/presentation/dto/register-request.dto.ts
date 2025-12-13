import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDto {
    @IsString({ message: '이메일은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '이메일은 필수 값입니다.' })
    public email!: string;

    @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '비밀번호는 필수 값입니다.' })
    public password!: string;

    @IsString({ message: '닉네임은 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '닉네임은 필수 값입니다.' })
    public nickname!: string;
}
