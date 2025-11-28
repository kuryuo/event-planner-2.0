import {baseApi} from "@/services/api/baseApi.ts";
import type {
    GetEventsResponse,
    GetEventsPayload,
    GetEventByIdResponse,
    CreateEventPayload,
    CreateEventResponse
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
        }),
        /**
         * Получить мероприятия по ID
         */
        getEventById: builder.query<GetEventByIdResponse, string>({
            query: (eventId) => ({
                url: `/events/${eventId}`,
                method: 'GET',
                eventId,
            }),
        }),
        createEvent: builder.mutation<CreateEventResponse, CreateEventPayload>({
            query: (body) => ({
                url: '/events',
                method: 'POST',
                body,
            })
        })
    }),
    overrideExisting: false,
});

export const {useGetEventsQuery, useGetEventByIdQuery, useCreateEventMutation} = eventApi;
