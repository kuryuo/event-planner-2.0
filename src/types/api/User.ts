export interface UserForeignProfile {
    id: string;
    email: string | null;
    passwordHash: string | null;
    lastName: string;
    firstName: string;
    middleName: string;
    phoneNumber: string | null;
    telegram: string | null;
    city: string | null;
    resetToken: string | null;
    avatarUrl: string | null;
    userPrivilege: number;
}

export interface Organizer {
    id: string;
    email: string | null;
    passwordHash: string | null;
    lastName: string;
    firstName: string;
    middleName: string;
    phoneNumber: string | null;
    telegram: string | null;
    city: string | null;
    resetToken: string | null;
    avatarUrl: string | null;
    userPrivilege: number;
}

