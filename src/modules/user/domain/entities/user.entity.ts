export interface UserPublicInfo {
    id: string;
    email: string;
    nickname: string;
    createdAt: Date;
}

export class User {
    private readonly id: string;
    private readonly email: string;
    private readonly hashedPassword: string;
    private readonly nickname: string;
    private readonly profileImage?: string;
    private readonly createdAt: Date;
    private readonly updatedAt: Date;

    private constructor(params: {
        id: string;
        email: string;
        hashedPassword: string;
        nickname: string;
        profileImage?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.assertString(params.id, 'User id');
        this.assertString(params.email, 'User email');
        this.assertString(params.hashedPassword, 'User hashedPassword');
        this.assertString(params.nickname, 'User nickname');

        this.id = params.id;
        this.email = params.email;
        this.hashedPassword = params.hashedPassword;
        this.nickname = params.nickname;
        this.profileImage = params.profileImage;
        this.createdAt = params.createdAt ?? new Date();
        this.updatedAt = params.updatedAt ?? this.createdAt;
    }

    public static create(params: {
        id: string;
        email: string;
        hashedPassword: string;
        nickname: string;
        profileImage?: string;
        createdAt?: Date;
    }): User {
        return new User(params);
    }

    public static reconstitute(params: {
        id: string;
        email: string;
        hashedPassword: string;
        nickname: string;
        profileImage?: string;
        createdAt: Date;
        updatedAt?: Date;
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

    public getProfileImage(): string | undefined {
        return this.profileImage;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public toPublicInfo(): UserPublicInfo {
        return {
            id: this.id,
            email: this.email,
            nickname: this.nickname,
            createdAt: this.createdAt,
        };
    }

    public update(params: {
        nickname?: string;
        profileImage?: string;
        hashedPassword?: string;
    }): User {
        return new User({
            id: this.id,
            email: this.email,
            hashedPassword: params.hashedPassword ?? this.hashedPassword,
            nickname: params.nickname ?? this.nickname,
            profileImage: params.profileImage ?? this.profileImage,
            createdAt: this.createdAt,
            updatedAt: new Date(),
        });
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
