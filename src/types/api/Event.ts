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

export type EventLifecycleState = 'Draft' | 'Published' | 'Completed' | 'Cancelled';

export type VenueFormat = 'InPerson' | 'Online' | 'Hybrid';

export type EventTypeKind =
    | 'Hackathon'
    | 'Lecture'
    | 'PP'
    | 'SpecialCourse'
    | 'Practice'
    | 'CereerEvent';

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
    status?: EventLifecycleState;
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
        }>;
        totalCount: number;
    };
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

export interface EventBoardTask {
    id: string;
    title?: string | null;
    description?: string | null;
    assigneeName?: string | null;
    assignedUserName?: string | null;
    dueDate?: string | null;
    deadline?: string | null;
    priority?: string | null;
    commentsCount?: number;
    commentCount?: number;
}

export interface EventBoardColumn {
    id: string;
    name?: string | null;
    tasks?: EventBoardTask[];
    boardTasks?: EventBoardTask[];
}

export interface GetEventBoardResponse {
    result?: {
        columns?: EventBoardColumn[];
        boardColumns?: EventBoardColumn[];
    };
    columns?: EventBoardColumn[];
    boardColumns?: EventBoardColumn[];
}

export type BoardTaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface GetEventBoardPayload {
    eventId: string;
    q?: string;
    deadlines?: string;
    assigneeIds?: string;
    priorities?: string;
    mineOnly?: boolean;
    sort?: 'UrgentFirst' | 'Newest' | 'Oldest' | 'AssigneeAsc';
}

export interface BoardFacetsResponse {
    result?: Array<{ id: string; displayName?: string | null; avatarUrl?: string | null }>;
}

export interface EventAttachment {
    id: string;
    title?: string | null;
    fileName?: string | null;
    filePath?: string | null;
    url?: string | null;
    createdAt?: string | null;
    type?: string | null;
    authorDisplayName?: string | null;
    authorAvatarUrl?: string | null;
    fileExtension?: string | null;
    linkSiteKey?: string | null;
}

export interface GetEventAttachmentsPayload {
    eventId: string;
    q?: string;
    kinds?: string;
    authorIds?: string;
    extensions?: string;
    linkSites?: string;
    sort?: 'Newest' | 'Oldest' | 'TitleAsc' | 'AuthorAsc';
}

export interface EventAttachmentFacetsResponse {
    result?: {
        fileExtensions?: Array<{ extension: string; label: string }>;
        linkSites?: Array<{ siteKey: string; label: string }>;
        authors?: Array<{ id: string; displayName?: string | null; avatarUrl?: string | null }>;
    };
}

export interface EventNote {
    id: string;
    text: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface EventTaskComment {
    id: string;
    text: string;
    authorName?: string | null;
    createdAt?: string | null;
}

export interface EventTaskHistoryItem {
    id: string;
    action?: string | null;
    description?: string | null;
    authorName?: string | null;
    createdAt?: string | null;
}

export interface AddTaskCommentPayload {
    eventId: string;
    taskId: string;
    text: string;
}

export interface CreateBoardColumnPayload {
    eventId: string;
    name: string;
}

export interface UpdateBoardColumnPayload {
    eventId: string;
    columnId: string;
    name?: string;
    order?: number;
}

export interface DeleteBoardColumnPayload {
    eventId: string;
    columnId: string;
}

export interface CreateBoardTaskPayload {
    eventId: string;
    columnId: string;
    title: string;
    description?: string;
    assignedUserId?: string;
    dueDate?: string;
    priority?: BoardTaskPriority;
}

export interface UpdateBoardTaskPayload {
    eventId: string;
    taskId: string;
    title?: string;
    description?: string;
    assigneeId?: string;
    deadline?: string;
    priority?: BoardTaskPriority;
}

export interface DeleteBoardTaskPayload {
    eventId: string;
    taskId: string;
}

export interface MoveBoardTaskPayload {
    eventId: string;
    taskId: string;
    targetColumnId: string;
    newOrder: number;
}

export interface UploadEventAttachmentFilePayload {
    eventId: string;
    file: File;
}

export interface UploadEventAttachmentLinkPayload {
    eventId: string;
    title?: string;
    url: string;
}

export interface DeleteEventAttachmentPayload {
    eventId: string;
    attachmentId: string;
}

export interface DownloadEventAttachmentPayload {
    eventId: string;
    attachmentId: string;
}

export interface CreateEventNotePayload {
    eventId: string;
    text: string;
}

export interface UpdateEventNotePayload {
    eventId: string;
    noteId: string;
    text: string;
}

export interface UpdateEventCancellationPayload {
    eventId: string;
    isCancelled: boolean;
}

export interface UpdateEventLifecyclePayload {
    eventId: string;
    lifecycleState: EventLifecycleState;
}

export interface CopyEventTemplatePayload {
    eventId: string;
    name: string;
}
