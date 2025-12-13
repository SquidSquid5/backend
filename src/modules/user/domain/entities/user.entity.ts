export class User {
    private readonly id: string;
    private readonly email: string;
    private readonly hashedPassword: string;
    private readonly nickname: string;
    private readonly createdAt: Date;

    private constructor(params: {
        id: string;
        email: string;
        hashedPassword: string;
        nickname: string;
        createdAt?: Date;
    }) {
        this.assertString(params.id, 'User id');
        this.assertString(params.email, 'User email');
        this.assertString(params.hashedPassword, 'User hashedPassword');
        this.assertString(params.nickname, 'User nickname');

        this.id = params.id;
        this.email = params.email;
        this.hashedPassword = params.hashedPassword;
        this.nickname = params.nickname;
        this.createdAt = params.createdAt ?? new Date();
    }

    public static create(params: {
        id: string;
        email: string;
        hashedPassword: string;
        nickname: string;
        createdAt?: Date;
    }): User {
        return new User(params);
    }

    public static reconstitute(params: {
        id: string;
        email: string;
        hashedPassword: string;
        nickname: string;
        createdAt: Date;
    }): User {
        return new User(params);
    }

    public getId(): string {
        return this.id;
    }

    public getEmail(): string {
        return this.email;
    }

    public getHashedPassword(): string {
        return this.hashedPassword;
    }

    public getNickname(): string {
        return this.nickname;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    private assertString(value: string, fieldName: string): void {
        if (
            value === undefined ||
            value === null ||
            value.trim().length === 0
        ) {
            throw new Error(`${fieldName} cannot be empty`);
        }
    }
}
