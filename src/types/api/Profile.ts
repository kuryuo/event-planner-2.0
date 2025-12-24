export interface UserProfile {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string;
    phoneNumber: string | null;
    telegram: string | null;
    city: string | null;
    avatarUrl: string | null;
}

export interface UpdateUserProfilePayload {
    lastName: string;
    firstName: string;
    middleName: string;
    phoneNumber: string;
    telegram: string;
    city: string;
}

export interface UserEvent {
    id: string;
    name: string;
    avatar?: string | null;
    description: string | null;
    startDate: string;
    endDate: string;
    location: string | null;
    format: 'online' | 'offline';
    eventType: 'open' | 'closed' | string;
    responsiblePersonId: string;
    maxParticipants: number;
    color?: string;
    categories: string[];
    previewPhotos: string[];
    status: string | null;
}

export interface UpdateUserAvatarPayload {
    file: File;
}