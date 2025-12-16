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
    GetEventSubscribersResponse
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
            query: (body) => ({
                url: '/events',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Event'],
        }),
        /**
         * Обновить мероприятие
         */
        updateEvent: builder.mutation<UpdateEventResponse, {eventId: string; body: UpdateEventPayload}>({
            query: ({eventId, body}) => ({
                url: `/events/${eventId}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'Event'] : ['Event'],
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
    }),
    overrideExisting: false,
});

export const {
    useGetEventsQuery,
    useGetEventByIdQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useGetEventSubscribersQuery
} = eventApi;
