export interface AdminPayload {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    city?: string;
    offset?: number;
    count: number;
}

export interface AdminResponse {
    result: AdminUser[];
}

export interface AdminUser {
    id: string;
    lastName: string | null;
    firstName: string | null;
    middleName: string | null;
    phoneNumber: string | null;
    telegram: string | null;
    city: string | null;
    educationalInstitution: string | null;
    courseNumber: number | null;
    avatarUrl: string | null;
}

export interface UpdateAdminUserFormData {
    file?: File | null;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    phoneNumber?: string;
    telegram?: string;
    city?: string;
}

export type UpdateAdminUserResponse = AdminUser;
