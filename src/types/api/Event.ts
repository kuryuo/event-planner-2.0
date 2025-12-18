// Тип события из API response (GET /events, GET /events/{id}, POST /events response)
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
}

// Payload для создания мероприятия (POST /events)
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
}

// Payload для GET /events (фильтры)
export interface GetEventsPayload {
    start?: string;
    end?: string;
    name?: string;
    organizers?: string[];
    format?: string;
    hasFreePlaces?: boolean;
    categories?: string[];
    offset?: number;
    count: number;
}

// Response для GET /events
export interface GetEventsResponse {
    result: EventResponse[];
}

// Response для GET /events/{id}
export interface GetEventByIdResponse {
    result: EventResponse;
}

// Payload для PUT /events/{id} (обновление мероприятия)
export interface UpdateEventPayload {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    maxParticipants: number;
}

// Response для POST /events
export interface CreateEventResponse {
    result: EventResponse;
}

// Response для PUT /events/{id}
export interface UpdateEventResponse {
    result: EventResponse;
}

// Payload для GET /events/{eventId}/subscribers
export interface GetEventSubscribersPayload {
    eventId: string;
    name?: string;
    count?: number;
    offset?: number;
}

// Response для GET /events/{eventId}/subscribers
export interface GetEventSubscribersResponse {
    res: Array<{
        id: string;
        email: string | null;
        name: string | null;
        phoneNumber: string | null;
        telegram: string | null;
        city: string | null;
        avatarUrl: string | null;
        role: string | null;
    }>;
}

// Response для GET /events/{eventId}/contacts
export interface GetEventContactsResponse {
    result: Array<{
        name: string;
        role: string;
        avatarUrl: string;
    }>;
}

// Тип поста мероприятия
export interface EventPost {
    id: string;
    eventId: string;
    authorId: string;
    text: string;
    createdAt: string;
}

// Payload для GET /events/{eventId}/posts
export interface GetEventPostsPayload {
    eventId: string;
    count?: number;
    offset?: number;
}

// Response для GET /events/{eventId}/posts
export interface GetEventPostsResponse {
    result: EventPost[];
}

// Payload для POST /events/{eventId}/posts
export interface CreateEventPostPayload {
    eventId: string;
    text: string;
}

// Response для POST /events/{eventId}/posts
export interface CreateEventPostResponse {
    result: EventPost;
}

// Payload для GET /events/{eventId}/posts/{postId}
export interface GetEventPostByIdPayload {
    eventId: string;
    postId: string;
}

// Response для GET /events/{eventId}/posts/{postId}
export interface GetEventPostByIdResponse {
    result: EventPost;
}

// Payload для PUT /events/{eventId}/posts/{postId}
export interface UpdateEventPostPayload {
    eventId: string;
    postId: string;
    text: string;
}

// Response для PUT /events/{eventId}/posts/{postId}
export interface UpdateEventPostResponse {
    result: EventPost;
}

// Payload для DELETE /events/{eventId}/posts/{postId}
export interface DeleteEventPostPayload {
    eventId: string;
    postId: string;
}

// Payload для GET /events/{eventId}/photos
export interface GetEventPhotosPayload {
    eventId: string;
    offset?: number;
    count: number;
}

// Response для GET /events/{eventId}/photos
export interface GetEventPhotosResponse {
    result: Array<{
        id: string;
        filePath: string;
    }>;
}

// Payload для POST /events/{eventId}/photos
export interface UploadEventPhotoPayload {
    eventId: string;
    file: File;
}

// Response для POST /events/{eventId}/photos
export interface UploadEventPhotoResponse {
    path: string;
}

// Payload для DELETE /events/{eventId}/photos/{photoId}
export interface DeleteEventPhotoPayload {
    eventId: string;
    photoId: string;
    roleId?: string;
}