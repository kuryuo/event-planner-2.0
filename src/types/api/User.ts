export interface UserForeignProfile {
    id: string;
    email: string | null;
    passwordHash: string | null;
    lastName: string;
    firstName: string;
    middleName: string;
    profession?: string | null;
    phoneNumber: string | null;
    telegram: string | null;
    city: string | null;
    resetToken: string | null;
    avatarUrl: string | null;
    backgroundUrl?: string | null;
    userPrivilege: number;
}

export interface Organizer {
    id: string;
    email: string | null;
    passwordHash: string | null;
    lastName: string;
    firstName: string;
    middleName: string;
    profession?: string | null;
    phoneNumber: string | null;
    telegram: string | null;
    city: string | null;
    resetToken: string | null;
    avatarUrl: string | null;
    backgroundUrl?: string | null;
    userPrivilege: number;
}

