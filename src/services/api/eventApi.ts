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
    AssignUserRolePayload,
    CreateEventRolePayload
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
        getEventBoard: builder.query<GetEventBoardResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/board`,
                method: 'GET',
            }),
            providesTags: (result, _error, eventId) =>
                result ? [{type: 'Event', id: eventId}] : ['Event'],
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
        unsubscribeFromEvent: builder.mutation<void, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/unsubscribe`,
                method: 'POST',
            }),
            invalidatesTags: ['Profile', 'Event', 'Profile'],
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
    }),
    overrideExisting: false,
});

export const {
    useGetEventsQuery,
    useGetMyEventsQuery,
    useGetEventByIdQuery,
    useGetEventBoardQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useGetEventSubscribersQuery,
    useGetEventPhotosQuery,
    useUploadEventPhotoMutation,
    useDeleteEventPhotoMutation,
    useSubscribeToEventMutation,
    useUnsubscribeFromEventMutation,
    useUploadEventAvatarMutation,
    useGetEventRolesQuery,
    useAssignUserRoleMutation,
    useCreateEventRoleMutation
} = eventApi;
