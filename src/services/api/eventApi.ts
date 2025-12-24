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
    GetEventContactsResponse,
    GetEventPhotosPayload,
    GetEventPhotosResponse,
    UploadEventPhotoPayload,
    UploadEventPhotoResponse,
    DeleteEventPhotoPayload
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
        /**
         * Получить мероприятие по ID
         */
        getEventById: builder.query<GetEventByIdResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'GET',
                eventId,
            }),
            providesTags: (result, error, eventId) =>
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
                result ? ['Event'] : [],
        }),
        /**
         * Обновить мероприятие
         */
        updateEvent: builder.mutation<UpdateEventResponse, {eventId: string; body: UpdateEventPayload}>({
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
            invalidatesTags: (result, error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : [],
        }),
        /**
         * Удалить мероприятие
         */
        deleteEvent: builder.mutation<void, string>({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, eventId) =>
                [{type: 'Event', id: eventId}, 'Event'],
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
            providesTags: (result, error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}] : ['Event'],
        }),
        /**
         * Получить контакты мероприятия
         */
        getEventContacts: builder.query<GetEventContactsResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/contacts`,
                method: 'GET',
            }),
            providesTags: (result, error, eventId) =>
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
            providesTags: (result, error, {eventId}) =>
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
            invalidatesTags: (result, error, {eventId}) =>
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
            invalidatesTags: (result, error, {eventId}) =>
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
            invalidatesTags: ['Profile', 'Event'],
        }),
        /**
         * Отписаться от мероприятия
         */
        unsubscribeFromEvent: builder.mutation<void, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/unsubscribe`,
                method: 'POST',
            }),
            invalidatesTags: ['Profile', 'Event'],
        }),
        /**
         * Загрузить аватар мероприятия
         */
        uploadEventAvatar: builder.mutation<void, {eventId: string; avatar: File}>({
            query: ({eventId, avatar}) => {
                const formData = new FormData();
                formData.append('avatar', avatar);
                return {
                    url: `/events/${eventId}/avatar`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : [],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetEventsQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useGetEventSubscribersQuery,
    useGetEventContactsQuery,
    useGetEventPhotosQuery,
    useUploadEventPhotoMutation,
    useDeleteEventPhotoMutation,
    useSubscribeToEventMutation,
    useUnsubscribeFromEventMutation,
    useUploadEventAvatarMutation
} = eventApi;
