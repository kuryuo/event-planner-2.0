import {baseApi} from '@/services/api/baseApi.ts';
import type {
    ChatMessage,
    GetChatMessagesPayload,
    SendChatMessagePayload,
    SendChatMessageWithFilesPayload,
} from '@/types/api/Chat.ts';

const toMessagesArray = (response: unknown): ChatMessage[] => {
    if (Array.isArray(response)) {
        return response as ChatMessage[];
    }

    if (!response || typeof response !== 'object') {
        return [];
    }

    const container = response as {result?: unknown; res?: unknown; data?: unknown};

    if (Array.isArray(container.result)) return container.result as ChatMessage[];
    if (Array.isArray(container.res)) return container.res as ChatMessage[];
    if (Array.isArray(container.data)) return container.data as ChatMessage[];

    return [];
};

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEventChatMessages: builder.query<ChatMessage[], GetChatMessagesPayload>({
            query: ({eventId, count = 50, offset = 0}) => ({
                url: `/events/${eventId}/chat/messages`,
                method: 'GET',
                params: {count, offset},
            }),
            transformResponse: (response: unknown) => toMessagesArray(response),
            providesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        sendEventChatMessage: builder.mutation<void, SendChatMessagePayload>({
            query: ({eventId, text, replyToMessageId}) => ({
                url: `/events/${eventId}/chat/messages`,
                method: 'POST',
                body: {
                    text,
                    replyToMessageId,
                },
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        sendEventChatMessageWithFiles: builder.mutation<void, SendChatMessageWithFilesPayload>({
            query: ({eventId, text, files = [], replyToMessageId}) => {
                const formData = new FormData();

                if (text) {
                    formData.append('Text', text);
                }

                files.forEach(file => {
                    formData.append('Files', file);
                });

                if (replyToMessageId) {
                    formData.append('ReplyToMessageId', replyToMessageId);
                }

                return {
                    url: `/events/${eventId}/chat/messages/with-files`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
    }),
});

export const {
    useGetEventChatMessagesQuery,
    useSendEventChatMessageMutation,
    useSendEventChatMessageWithFilesMutation,
} = chatApi;
