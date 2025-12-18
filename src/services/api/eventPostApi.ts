import {baseApi} from "@/services/api/baseApi.ts";
import type {
    GetEventPostsPayload,
    GetEventPostsResponse,
    CreateEventPostPayload,
    CreateEventPostResponse,
    GetEventPostByIdPayload,
    GetEventPostByIdResponse,
    UpdateEventPostPayload,
    UpdateEventPostResponse,
    DeleteEventPostPayload
} from "@/types/api/Event.ts";

export const eventPostApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Получить все посты на мероприятии
         */
        getEventPosts: builder.query<GetEventPostsResponse, GetEventPostsPayload>({
            query: ({eventId, count, offset}) => ({
                url: `/events/${eventId}/posts`,
                method: 'GET',
                params: {
                    ...(count !== undefined && {count}),
                    ...(offset !== undefined && {offset}),
                },
            }),
            providesTags: (result, error, {eventId}) =>
                result ? [{type: 'Event', id: eventId}, 'EventPost'] : ['EventPost'],
        }),
        /**
         * Создать пост на странице мероприятия
         */
        createEventPost: builder.mutation<CreateEventPostResponse, CreateEventPostPayload>({
            query: ({eventId, text}) => ({
                url: `/events/${eventId}/posts`,
                method: 'POST',
                params: {
                    text,
                },
            }),
            invalidatesTags: (result, error, {eventId}) =>
                [{type: 'Event', id: eventId}, 'EventPost'],
        }),
        /**
         * Получить пост мероприятия по ID
         */
        getEventPostById: builder.query<GetEventPostByIdResponse, GetEventPostByIdPayload>({
            query: ({eventId, postId}) => ({
                url: `/events/${eventId}/posts/${postId}`,
                method: 'GET',
            }),
            providesTags: (result, error, {eventId, postId}) =>
                result ? [{type: 'EventPost', id: postId}, {type: 'Event', id: eventId}] : ['EventPost'],
        }),
        /**
         * Обновить пост
         */
        updateEventPost: builder.mutation<UpdateEventPostResponse, UpdateEventPostPayload>({
            query: ({eventId, postId, text}) => ({
                url: `/events/${eventId}/posts/${postId}`,
                method: 'PUT',
                params: {
                    text,
                },
            }),
            invalidatesTags: (result, error, {eventId, postId}) =>
                [{type: 'EventPost', id: postId}, {type: 'Event', id: eventId}, 'EventPost'],
        }),
        /**
         * Удалить пост
         */
        deleteEventPost: builder.mutation<void, DeleteEventPostPayload>({
            query: ({eventId, postId}) => ({
                url: `/events/${eventId}/posts/${postId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, {eventId, postId}) =>
                [{type: 'EventPost', id: postId}, {type: 'Event', id: eventId}, 'EventPost'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetEventPostsQuery,
    useCreateEventPostMutation,
    useGetEventPostByIdQuery,
    useUpdateEventPostMutation,
    useDeleteEventPostMutation
} = eventPostApi;

