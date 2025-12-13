import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from '@nestjs/common';
import {
    USER_USE_CASE,
    type UserUseCase,
} from '@user/domain/ports/inbound/user.usecase';
import { RegisterRequestDto } from '@user/presentation/dto/register-request.dto';
import { RegisterResponseDto } from '@user/presentation/dto/register-response.dto';

@Controller('api/users')
export class UsersController {
    constructor(
        @Inject(USER_USE_CASE)
        private readonly userUseCase: UserUseCase,
    ) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    public async register(
        @Body() request: RegisterRequestDto,
    ): Promise<RegisterResponseDto> {
        const user = await this.userUseCase.register({
            email: request.email,
            password: request.password,
            nickname: request.nickname,
        });

        return new RegisterResponseDto(user);
    }
}
