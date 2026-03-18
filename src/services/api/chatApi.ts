import {baseApi} from '@/services/api/baseApi.ts';
import type {
    AddChatMessageAttachmentsPayload,
    ChatMessage,
    DeleteChatMessageAttachmentPayload,
    DeleteChatMessagePayload,
    GetChatMessagesPayload,
    SearchChatMessagesPayload,
    SendChatMessagePayload,
    SendChatMessageWithFilesPayload,
    UpdateChatMessagePayload,
} from '@/types/api/Chat.ts';

const mapMessage = (item: unknown): ChatMessage | null => {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const source = item as Record<string, unknown>;
    const messageId = String(source.id ?? source.messageId ?? '');
    if (!messageId) {
        return null;
    }

    const rawAuthor = source.author ?? source.sender;
    const authorFromObject = rawAuthor && typeof rawAuthor === 'object'
        ? String(
            (rawAuthor as Record<string, unknown>).name
            ?? [
                (rawAuthor as Record<string, unknown>).firstName,
                (rawAuthor as Record<string, unknown>).lastName,
            ].filter(Boolean).join(' ')
        ).trim()
        : '';

    const authorIdFromObject = rawAuthor && typeof rawAuthor === 'object'
        ? String((rawAuthor as Record<string, unknown>).id ?? '')
        : '';

    const rawAttachments = source.attachments;
    const attachments = Array.isArray(rawAttachments)
        ? rawAttachments
            .filter((attachment): attachment is Record<string, unknown> => Boolean(attachment && typeof attachment === 'object'))
            .map((attachment) => ({
                id: String(attachment.id ?? attachment.attachmentId ?? ''),
                fileName: (
                    (attachment.fileName as string | null | undefined)
                    ?? (attachment.originalFileName as string | null | undefined)
                    ?? null
                ),
                filePath: (attachment.filePath as string | null | undefined) ?? null,
                contentType: (attachment.contentType as string | null | undefined) ?? null,
                size: typeof attachment.size === 'number' ? attachment.size : null,
            }))
            .filter((attachment) => Boolean(attachment.id))
        : [];

    const rawReply = source.replyToMessage ?? source.replyTo;
    const replyToMessage = rawReply && typeof rawReply === 'object'
        ? {
            id: String((rawReply as Record<string, unknown>).id ?? ''),
            authorName: (
                ((rawReply as Record<string, unknown>).authorName as string | null | undefined)
                ?? ((rawReply as Record<string, unknown>).senderName as string | null | undefined)
                ?? null
            ),
            text: ((rawReply as Record<string, unknown>).text as string | null | undefined) ?? null,
        }
        : null;

    return {
        id: messageId,
        eventId: source.eventId ? String(source.eventId) : undefined,
        authorId: source.authorId
            ? String(source.authorId)
            : (authorIdFromObject || undefined),
        authorName: (
            (source.authorName as string | null | undefined)
            ?? (source.name as string | null | undefined)
            ?? authorFromObject
            ?? null
        ),
        text: String(source.text ?? ''),
        createdAt: String(source.createdAt ?? new Date().toISOString()),
        isEdited: Boolean(source.isEdited) || Boolean(source.updatedAt),
        replyToMessageId: source.replyToMessageId ? String(source.replyToMessageId) : null,
        replyToMessage: replyToMessage?.id ? replyToMessage : null,
        attachments,
    };
};

const toMessagesArray = (response: unknown): ChatMessage[] => {
    if (Array.isArray(response)) {
        return response.map(mapMessage).filter((message): message is ChatMessage => message !== null);
    }

    if (!response || typeof response !== 'object') {
        return [];
    }

    const container = response as {result?: unknown; res?: unknown; data?: unknown};

    if (Array.isArray(container.result)) {
        return container.result.map(mapMessage).filter((message): message is ChatMessage => message !== null);
    }

    if (Array.isArray(container.res)) {
        return container.res.map(mapMessage).filter((message): message is ChatMessage => message !== null);
    }

    if (Array.isArray(container.data)) {
        return container.data.map(mapMessage).filter((message): message is ChatMessage => message !== null);
    }

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
            transformResponse: (response: unknown, _meta, arg) => {
                if (import.meta.env.DEV) {
                    console.group('[Chat][IN] getEventChatMessages response');
                    console.log('request:', arg);
                    console.log('raw response:', response);
                    console.groupEnd();
                }

                return toMessagesArray(response);
            },
            providesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        searchEventChatMessages: builder.query<ChatMessage[], SearchChatMessagesPayload>({
            query: ({eventId, text, maxResults = 100}) => ({
                url: `/events/${eventId}/chat/messages/search`,
                method: 'GET',
                params: {text, maxResults},
            }),
            transformResponse: (response: unknown) => toMessagesArray(response),
        }),
        sendEventChatMessage: builder.mutation<void, SendChatMessagePayload>({
            query: ({eventId, text, replyToMessageId}) => {
                if (import.meta.env.DEV) {
                    console.group('[Chat][OUT] sendEventChatMessage payload');
                    console.log({eventId, text, replyToMessageId});
                    console.groupEnd();
                }

                return {
                    url: `/events/${eventId}/chat/messages`,
                    method: 'POST',
                    body: {
                        text,
                        replyToMessageId,
                    },
                };
            },
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        sendEventChatMessageWithFiles: builder.mutation<void, SendChatMessageWithFilesPayload>({
            query: ({eventId, text, files = [], replyToMessageId}) => {
                if (import.meta.env.DEV) {
                    console.group('[Chat][OUT] sendEventChatMessageWithFiles payload');
                    console.log({
                        eventId,
                        text,
                        replyToMessageId,
                        files: files.map((file) => ({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                        })),
                    });
                    console.groupEnd();
                }

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
        updateEventChatMessage: builder.mutation<void, UpdateChatMessagePayload>({
            query: ({eventId, messageId, text, removeAttachmentIds}) => ({
                url: `/events/${eventId}/chat/messages/${messageId}`,
                method: 'PATCH',
                body: {
                    text,
                    removeAttachmentIds,
                },
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        deleteEventChatMessage: builder.mutation<void, DeleteChatMessagePayload>({
            query: ({eventId, messageId}) => ({
                url: `/events/${eventId}/chat/messages/${messageId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        addEventChatMessageAttachments: builder.mutation<void, AddChatMessageAttachmentsPayload>({
            query: ({eventId, messageId, files}) => {
                const formData = new FormData();
                files.forEach((file) => {
                    formData.append('Files', file);
                });

                return {
                    url: `/events/${eventId}/chat/messages/${messageId}/attachments`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
        deleteEventChatMessageAttachment: builder.mutation<void, DeleteChatMessageAttachmentPayload>({
            query: ({eventId, messageId, attachmentId}) => ({
                url: `/events/${eventId}/chat/messages/${messageId}/attachments/${attachmentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {eventId}) => [{type: 'Chat', id: eventId}],
        }),
    }),
});

export const {
    useGetEventChatMessagesQuery,
    useLazySearchEventChatMessagesQuery,
    useSendEventChatMessageMutation,
    useSendEventChatMessageWithFilesMutation,
    useUpdateEventChatMessageMutation,
    useDeleteEventChatMessageMutation,
    useAddEventChatMessageAttachmentsMutation,
    useDeleteEventChatMessageAttachmentMutation,
} = chatApi;
