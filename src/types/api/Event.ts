export interface EventResponse {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    responsiblePersonId: string;
    maxParticipants: number;
    categories: string[];
    previewPhotos: string[];
    status: string | null;
    avatar?: string | null;
    color?: string;
}

export interface CreateEventPayload {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    responsiblePersonId: string;
    maxParticipants: number;
    categories: string[];
    roles: string[];
    color: string;
    avatar?: File | null;
}

export interface GetEventsPayload {
    Start?: string;
    End?: string;
    Name?: string;
    Organizators?: string[];
    Format?: string;
    HasFreePlaces?: boolean;
    Categories?: string[];
    Offset?: number;
    Count?: number;
}

export interface GetEventsResponse {
    result: EventResponse[];
}

export interface GetEventByIdResponse {
    result: EventResponse;
}

export interface UpdateEventPayload {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    maxParticipants: number;
    color: string;
    avatar?: File | null;
}

export interface CreateEventResponse {
    result: EventResponse;
}

export interface UpdateEventResponse {
    result: EventResponse;
}

export interface GetEventSubscribersPayload {
    eventId: string;
    name?: string;
    count?: number;
    offset?: number;
}

export interface GetEventSubscribersResponse {
    res: {
        users: Array<{
            id: string;
            email: string | null;
            name: string | null;
            phoneNumber: string | null;
            telegram: string | null;
            city: string | null;
            avatarUrl: string | null;
            role: string | null;
            isContact?: boolean;
        }>;
        totalCount: number;
    };
}

export interface GetEventContactsResponse {
    result: Array<{
        name: string;
        role: string;
        avatarUrl: string;
    }>;
}

export interface EventPost {
    id: string;
    eventId: string;
    authorId: string;
    title: string;
    text: string;
    createdAt: string;
}

export interface GetEventPostsPayload {
    eventId: string;
    count?: number;
    offset?: number;
}

export interface GetEventPostsResponse {
    result: EventPost[];
}

export interface CreateEventPostPayload {
    eventId: string;
    title: string;
    text: string;
}

export interface CreateEventPostResponse {
    result: EventPost;
}

export interface GetEventPostByIdPayload {
    eventId: string;
    postId: string;
}

export interface GetEventPostByIdResponse {
    result: EventPost;
}

export interface UpdateEventPostPayload {
    eventId: string;
    postId: string;
    title: string;
    text: string;
}

export interface UpdateEventPostResponse {
    result: EventPost;
}

export interface DeleteEventPostPayload {
    eventId: string;
    postId: string;
}

export interface GetEventPhotosPayload {
    eventId: string;
    offset?: number;
    count: number;
}

export interface GetEventPhotosResponse {
    result: Array<{
        id: string;
        filePath: string;
    }>;
}

export interface UploadEventPhotoPayload {
    eventId: string;
    file: File;
}

export interface UploadEventPhotoResponse {
    path: string;
}

export interface DeleteEventPhotoPayload {
    eventId: string;
    photoId: string;
    roleId?: string;
}