export interface AdminPayload {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    city?: string;
    offset?: number;
    count: number;
}

export interface PersonBase {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    telegram?: string | null;
    city?: string | null;
}

export interface AdminUser extends PersonBase {
    id: string;
    avatarUrl?: string | null;
}

export interface AdminResponse {
    result: AdminUser[];
}

export interface UpdateAdminUserFormData extends PersonBase {
    file?: File | null;
}

export type UpdateAdminUserResponse = AdminUser;
