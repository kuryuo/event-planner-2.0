export interface EventResponse {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string | null;
    location: string;
    auditorium?: string | null;
    format?: string;
    venueFormat?: VenueFormat;
    eventType: string;
    responsiblePersonId?: string;
    maxParticipants: number;
    categories: string[];
    types?: EventTypeKind[];
    previewPhotos: string[];
    status: string | null;
    avatar?: string | null;
    color?: string;
}

export type VenueFormat = 'InPerson' | 'Online' | 'Hybrid';

export type EventTypeKind =
    | 'Hackathon'
    | 'Lecture'
    | 'Webinar'
    | 'UrFU'
    | 'PP'
    | 'SpecialCourse'
    | 'Practice';

export type ParticipantRoleKind = 'Organizer' | 'Editor' | 'Assistant' | 'Observer';

export interface EventParticipantAssignment {
    userId: string;
    role: ParticipantRoleKind;
}

export interface CreateEventPayload {
    name: string;
    description: string;
    startDate: string;
    endDate?: string | null;
    location: string;
    auditorium?: string | null;
    venueFormat: VenueFormat;
    categories?: string[];
    types?: EventTypeKind[];
    participants?: EventParticipantAssignment[];
    responsiblePersonId?: string;
    maxParticipants?: number | null;
    color?: string | null;
    avatar?: File | null;
}

export interface GetEventsPayload {
    Start?: string;
    End?: string;
    Name?: string;
    Organizators?: string[];
    VenueFormat?: VenueFormat;
    Types?: EventTypeKind[];
    Format?: string;
    HasFreePlaces?: boolean;
    Categories?: string[];
    MyEvents?: boolean;
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
    startDate?: string | null;
    endDate?: string | null;
    location: string;
    auditorium?: string | null;
    venueFormat: VenueFormat;
    types?: EventTypeKind[];
    maxParticipants?: number | null;
    color?: string | null;
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
    role?: string;
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

export interface GetEventRolesPayload {
    eventId: string;
    count?: number;
    offset?: number;
}

export interface EventRole {
    id: string;
    name: string;
    eventId: string;
}

export interface GetEventRolesResponse {
    res: EventRole[];
}

export interface AssignUserRolePayload {
    eventId: string;
    userId: string;
    participantRole: ParticipantRoleKind;
}

export interface CreateEventRolePayload {
    eventId: string;
    roleName: string;
}

export interface AddEventContactPayload {
    eventId: string;
    userId: string;
}

export interface RemoveEventContactPayload {
    eventId: string;
    userId: string;
}
