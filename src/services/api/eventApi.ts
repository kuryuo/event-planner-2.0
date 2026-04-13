import {baseApi} from "@/services/api/baseApi.ts";
import type {
    GetEventsResponse,
    GetEventsPayload,
    GetEventByIdResponse,
    CreateEventPayload,
    CreateEventResponse,
    UpdateEventPayload,
    UpdateEventResponse,
    GetEventSubscribersPayload,
    GetEventSubscribersResponse,
    GetEventPhotosPayload,
    GetEventPhotosResponse,
    UploadEventPhotoPayload,
    UploadEventPhotoResponse,
    DeleteEventPhotoPayload,
    GetEventRolesPayload,
    GetEventRolesResponse,
    GetEventBoardResponse,
    GetEventBoardPayload,
    BoardFacetsResponse,
    AssignUserRolePayload,
    CreateEventRolePayload,
    EventAttachment,
    GetEventAttachmentsPayload,
    EventAttachmentFacetsResponse,
    UploadEventAttachmentFilePayload,
    UploadEventAttachmentLinkPayload,
    DeleteEventAttachmentPayload,
    DownloadEventAttachmentPayload,
    EventNote,
    CreateEventNotePayload,
    UpdateEventNotePayload,
    EventTaskComment,
    AddTaskCommentPayload,
    EventTaskHistoryItem,
    UpdateEventCancellationPayload,
    UpdateEventLifecyclePayload,
    CopyEventTemplatePayload,
    CreateBoardColumnPayload,
    UpdateBoardColumnPayload,
    DeleteBoardColumnPayload,
    CreateBoardTaskPayload,
    UpdateBoardTaskPayload,
    DeleteBoardTaskPayload,
    MoveBoardTaskPayload
} from "@/types/api/Event.ts";

export const eventApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Поиск мероприятий по фильтрам
         */
        getEvents: builder.query<GetEventsResponse, GetEventsPayload>({
            query: (params) => ({
                url: '/events',
                method: 'GET',
                params,
            }),
            providesTags: ['Event'],
        }),
        getMyEvents: builder.query<GetEventsResponse, void>({
            query: () => ({
                url: '/events/myevents',
                method: 'GET',
            }),
            providesTags: ['Event'],
        }),
        getArchivedEvents: builder.query<GetEventsResponse, GetEventsPayload>({
            query: (params) => ({
                url: '/events/archive',
                method: 'GET',
                params,
            }),
            transformResponse: (response: any): GetEventsResponse => {
                if (Array.isArray(response)) {
                    return {result: response};
                }

                if (Array.isArray(response?.result)) {
                    return {result: response.result};
                }

                if (Array.isArray(response?.res?.events)) {
                    return {result: response.res.events};
                }

                if (Array.isArray(response?.events)) {
                    return {result: response.events};
                }

                return {result: []};
            },
            providesTags: ['Event'],
        }),
        /**
         * Получить мероприятие по ID
         */
        getEventById: builder.query<GetEventByIdResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'GET',
                eventId,
            }),
            providesTags: (result, _error, eventId) =>
                result ? [{type: 'Event', id: eventId}] : ['Event'],
        }),
        getEventBoard: builder.query<GetEventBoardResponse, GetEventBoardPayload>({
            query: ({eventId, ...params}) => ({
                url: `/events/${eventId}/board`,
                method: 'GET',
                params,
            }),
            providesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}] : ['Event', 'Board'],
        }),
        getEventBoardFacets: builder.query<BoardFacetsResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/board/facets`,
                method: 'GET',
            }),
            providesTags: (_result, _error, eventId) => [{type: 'Board', id: eventId}],
        }),
        getMyBoardTasks: builder.query<GetEventBoardResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/board/my-tasks`,
                method: 'GET',
            }),
            providesTags: (_result, _error, eventId) => [{type: 'Board', id: eventId}],
        }),
        getEventMyBoardTasks: builder.query<GetEventBoardResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/board/event/my-tasks`,
                method: 'GET',
            }),
            providesTags: (_result, _error, eventId) => [{type: 'Board', id: eventId}],
        }),
        /**
         * Создать мероприятие
         */
        createEvent: builder.mutation<CreateEventResponse, CreateEventPayload>({
            query: (payload) => {
                const {avatar, ...jsonPayload} = payload;
                const cleanedPayload = Object.fromEntries(
                    Object.entries(jsonPayload).map(([key, value]) => [
                        key,
                        value === '' ? null : value
                    ])
                );
                return {
                    url: '/events',
                    method: 'POST',
                    body: cleanedPayload,
                };
            },
            invalidatesTags: (result) =>
                result ? ['Event', 'Profile'] : [],
        }),
        /**
         * Обновить мероприятие
         */
        updateEvent: builder.mutation<UpdateEventResponse, { eventId: string; body: UpdateEventPayload }>({
            query: ({eventId, body}) => {
                const {avatar, ...jsonPayload} = body;
                const cleanedPayload = Object.fromEntries(
                    Object.entries(jsonPayload).map(([key, value]) => [
                        key,
                        value === '' ? null : value
                    ])
                );
                return {
                    url: `/events/${eventId}`,
                    method: 'PUT',
                    body: cleanedPayload,
                };
            },
            invalidatesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event', 'Profile'] : [],
        }),
        /**
         * Удалить мероприятие
         */
        deleteEvent: builder.mutation<void, string>({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, eventId) =>
                [{type: 'Event', id: eventId}, 'Event', 'Profile'],
        }),
        /**
         * Получить пользователей подписанных на мероприятие
         */
        getEventSubscribers: builder.query<GetEventSubscribersResponse, GetEventSubscribersPayload>({
            query: ({eventId, count, ...params}) => ({
                url: `/events/${eventId}/subscribers`,
                method: 'GET',
                params: {
                    count: count ?? 10,
                    ...params,
                },
            }),
            providesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}] : ['Event'],
        }),
        /**
         * Получить фотографии мероприятия
         */
        getEventPhotos: builder.query<GetEventPhotosResponse, GetEventPhotosPayload>({
            query: ({eventId, offset = 0, count}) => ({
                url: `/events/${eventId}/photos`,
                method: 'GET',
                params: {
                    offset,
                    count,
                },
            }),
            providesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}] : ['Event'],
        }),
        /**
         * Загрузить фотографию на мероприятие
         */
        uploadEventPhoto: builder.mutation<UploadEventPhotoResponse, UploadEventPhotoPayload>({
            query: ({eventId, file}) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: `/events/${eventId}/photos`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : ['Event'],
        }),
        /**
         * Удалить фотографию мероприятия
         */
        deleteEventPhoto: builder.mutation<void, DeleteEventPhotoPayload>({
            query: ({eventId, photoId, roleId}) => ({
                url: `/events/${eventId}/photos/${photoId}`,
                method: 'DELETE',
                params: roleId ? {roleId} : undefined,
            }),
            invalidatesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : ['Event'],
        }),
        /**
         * Подписаться на мероприятие
         */
        subscribeToEvent: builder.mutation<void, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/subscribe`,
                method: 'POST',
            }),
            invalidatesTags: ['Profile', 'Event', 'Profile'],
        }),
        /**
         * Отписаться от мероприятия
         */
        unsubscribeFromEvent: builder.mutation<void, { eventId: string; transferToUserId?: string } | string>({
            query: (payload) => {
                const eventId = typeof payload === 'string' ? payload : payload.eventId;
                const transferToUserId = typeof payload === 'string' ? undefined : payload.transferToUserId;
                return {
                    url: `/events/${eventId}/unsubscribe`,
                    method: 'POST',
                    params: transferToUserId ? {transferToUserId} : undefined,
                };
            },
            invalidatesTags: ['Profile', 'Event', 'Profile'],
        }),
        createBoardColumn: builder.mutation<void, CreateBoardColumnPayload>({
            query: ({eventId, name}) => ({
                url: `/events/${eventId}/board/columns`,
                method: 'POST',
                body: {name},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, 'Event', 'Board'],
        }),
        updateBoardColumn: builder.mutation<void, UpdateBoardColumnPayload>({
            query: ({eventId, columnId, name, order}) => ({
                url: `/events/${eventId}/board/columns/${columnId}`,
                method: 'PUT',
                body: {
                    ...(name !== undefined && {name}),
                    ...(order !== undefined && {order}),
                },
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, 'Event', 'Board'],
        }),
        deleteBoardColumn: builder.mutation<void, DeleteBoardColumnPayload>({
            query: ({eventId, columnId}) => ({
                url: `/events/${eventId}/board/columns/${columnId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, 'Event', 'Board'],
        }),
        createBoardTask: builder.mutation<void, CreateBoardTaskPayload>({
            query: ({eventId, columnId, title, description, assignedUserId, dueDate, priority}) => ({
                url: `/events/${eventId}/board/columns/${columnId}/tasks`,
                method: 'POST',
                body: {title, description, assignedUserId, dueDate, priority},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, 'Event', 'Board'],
        }),
        updateBoardTask: builder.mutation<void, UpdateBoardTaskPayload>({
            query: ({eventId, taskId, title, description, assigneeId, deadline, priority}) => ({
                url: `/events/${eventId}/board/tasks/${taskId}`,
                method: 'PUT',
                body: {title, description, assigneeId, deadline, priority},
            }),
            invalidatesTags: (_result, _error, {eventId, taskId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, {type: 'BoardTask', id: taskId}, 'Event', 'Board', 'BoardTask'],
        }),
        deleteBoardTask: builder.mutation<void, DeleteBoardTaskPayload>({
            query: ({eventId, taskId}) => ({
                url: `/events/${eventId}/board/tasks/${taskId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {eventId, taskId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, {type: 'BoardTask', id: taskId}, 'Event', 'Board', 'BoardTask'],
        }),
        moveBoardTask: builder.mutation<void, MoveBoardTaskPayload>({
            query: ({eventId, taskId, targetColumnId, newOrder}) => ({
                url: `/events/${eventId}/board/tasks/${taskId}/move`,
                method: 'POST',
                body: {targetColumnId, newOrder},
            }),
            invalidatesTags: (_result, _error, {eventId, taskId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, {type: 'BoardTask', id: taskId}, 'Event', 'Board', 'BoardTask'],
        }),
        /**
         * Загрузить аватар мероприятия
         */
        uploadEventAvatar: builder.mutation<void, { eventId: string; avatar: File }>({
            query: ({eventId, avatar}) => {
                const formData = new FormData();
                formData.append('avatar', avatar);
                return {
                    url: `/events/${eventId}/avatar`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event', 'Profile'] : ['Profile'],
        }),
        /**
         * Получить роли в рамках мероприятия
         */
        getEventRoles: builder.query<GetEventRolesResponse, GetEventRolesPayload>({
            query: ({eventId, count = 10, offset}) => ({
                url: `/events/${eventId}/roles`,
                method: 'GET',
                params: {
                    count,
                    ...(offset !== undefined && {offset}),
                },
            }),
            providesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}] : ['Event'],
        }),
        /**
         * Дать пользователю роль на мероприятии
         */
        assignUserRole: builder.mutation<void, AssignUserRolePayload>({
            query: ({eventId, userId, participantRole}) => ({
                url: `/events/${eventId}/users/${userId}/roles`,
                method: 'POST',
                body: {
                    participantRole,
                },
            }),
            invalidatesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : ['Event'],
        }),
        /**
         * Создать роль в рамках мероприятия
         */
        createEventRole: builder.mutation<void, CreateEventRolePayload>({
            query: ({eventId, roleName}) => ({
                url: `/events/${eventId}/roles`,
                method: 'POST',
                params: {
                    roleName,
                },
            }),
            invalidatesTags: (result, _error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : ['Event'],
        }),
        getEventAttachments: builder.query<EventAttachment[], GetEventAttachmentsPayload>({
            query: ({eventId, ...params}) => ({
                url: `/events/${eventId}/attachments`,
                method: 'GET',
                params,
            }),
            transformResponse: (response: any) => response?.result ?? response ?? [],
            providesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}],
        }),
        getEventAttachmentsFacets: builder.query<EventAttachmentFacetsResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/attachments/facets`,
                method: 'GET',
            }),
            providesTags: (_result, _error, eventId) => [{type: 'Event', id: eventId}],
        }),
        uploadEventAttachmentFile: builder.mutation<void, UploadEventAttachmentFilePayload>({
            query: ({eventId, file}) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: `/events/${eventId}/attachments/file`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        uploadEventAttachmentLink: builder.mutation<void, UploadEventAttachmentLinkPayload>({
            query: ({eventId, title, url}) => ({
                url: `/events/${eventId}/attachments/link`,
                method: 'POST',
                body: {title, url},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        deleteEventAttachment: builder.mutation<void, DeleteEventAttachmentPayload>({
            query: ({eventId, attachmentId}) => ({
                url: `/events/${eventId}/attachments/${attachmentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        downloadEventAttachment: builder.query<Blob, DownloadEventAttachmentPayload>({
            query: ({eventId, attachmentId}) => ({
                url: `/events/${eventId}/attachments/${attachmentId}/download`,
                method: 'GET',
                responseHandler: async (response) => response.blob(),
            }),
        }),
        getEventNotes: builder.query<EventNote[], string>({
            query: (eventId) => ({
                url: `/events/${eventId}/notes`,
                method: 'GET',
            }),
            transformResponse: (response: any) => response?.result ?? response ?? [],
            providesTags: (_result, _error, eventId) => [{type: 'Event', id: eventId}],
        }),
        createEventNote: builder.mutation<void, CreateEventNotePayload>({
            query: ({eventId, text}) => ({
                url: `/events/${eventId}/notes`,
                method: 'POST',
                body: {text},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        updateEventNote: builder.mutation<void, UpdateEventNotePayload>({
            query: ({eventId, noteId, text}) => ({
                url: `/events/${eventId}/notes/${noteId}`,
                method: 'PUT',
                body: {text},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        getTaskComments: builder.query<EventTaskComment[], { eventId: string; taskId: string }>({
            query: ({eventId, taskId}) => ({
                url: `/events/${eventId}/board/tasks/${taskId}/comments`,
                method: 'GET',
            }),
            transformResponse: (response: any) => response?.result ?? response ?? [],
            providesTags: (_result, _error, {taskId}) => [{type: 'BoardTask', id: taskId}],
        }),
        addTaskComment: builder.mutation<void, AddTaskCommentPayload>({
            query: ({eventId, taskId, text}) => ({
                url: `/events/${eventId}/board/tasks/${taskId}/comments`,
                method: 'POST',
                body: {text},
            }),
            invalidatesTags: (_result, _error, {eventId, taskId}) => [{type: 'Event', id: eventId}, {type: 'Board', id: eventId}, {type: 'BoardTask', id: taskId}, 'Event', 'Board', 'BoardTask'],
        }),
        getTaskHistory: builder.query<EventTaskHistoryItem[], { eventId: string; taskId: string }>({
            query: ({eventId, taskId}) => ({
                url: `/events/${eventId}/board/tasks/${taskId}/history`,
                method: 'GET',
            }),
            transformResponse: (response: any) => response?.result ?? response ?? [],
            providesTags: (_result, _error, {taskId}) => [{type: 'BoardTask', id: taskId}],
        }),
        updateEventCancellation: builder.mutation<void, UpdateEventCancellationPayload>({
            query: ({eventId, isCancelled}) => ({
                url: `/events/${eventId}/cancellation`,
                method: 'PATCH',
                body: {isCancelled},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        updateEventLifecycleState: builder.mutation<void, UpdateEventLifecyclePayload>({
            query: ({eventId, lifecycleState}) => ({
                url: `/events/${eventId}/lifecycle-state`,
                method: 'PATCH',
                body: {lifecycleState},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
        copyEventToTemplate: builder.mutation<void, CopyEventTemplatePayload>({
            query: ({eventId, name}) => ({
                url: `/events/${eventId}/copy-template`,
                method: 'POST',
                params: {name},
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Event', id: eventId}, 'Event'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetEventsQuery,
    useGetMyEventsQuery,
    useGetArchivedEventsQuery,
    useGetEventByIdQuery,
    useGetEventBoardQuery,
    useGetEventBoardFacetsQuery,
    useGetMyBoardTasksQuery,
    useGetEventMyBoardTasksQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useGetEventSubscribersQuery,
    useGetEventPhotosQuery,
    useUploadEventPhotoMutation,
    useDeleteEventPhotoMutation,
    useSubscribeToEventMutation,
    useUnsubscribeFromEventMutation,
    useCreateBoardColumnMutation,
    useUpdateBoardColumnMutation,
    useDeleteBoardColumnMutation,
    useCreateBoardTaskMutation,
    useUpdateBoardTaskMutation,
    useDeleteBoardTaskMutation,
    useMoveBoardTaskMutation,
    useUploadEventAvatarMutation,
    useGetEventRolesQuery,
    useAssignUserRoleMutation,
    useCreateEventRoleMutation,
    useGetEventAttachmentsQuery,
    useGetEventAttachmentsFacetsQuery,
    useUploadEventAttachmentFileMutation,
    useUploadEventAttachmentLinkMutation,
    useDeleteEventAttachmentMutation,
    useLazyDownloadEventAttachmentQuery,
    useGetEventNotesQuery,
    useCreateEventNoteMutation,
    useUpdateEventNoteMutation,
    useGetTaskCommentsQuery,
    useAddTaskCommentMutation,
    useGetTaskHistoryQuery,
    useUpdateEventCancellationMutation,
    useUpdateEventLifecycleStateMutation,
    useCopyEventToTemplateMutation
} = eventApi;
