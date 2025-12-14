export class LogoutResponseDto {
    public readonly message: string;

    constructor(message = '로그아웃되었습니다.') {
        this.message = message;
    }
}
