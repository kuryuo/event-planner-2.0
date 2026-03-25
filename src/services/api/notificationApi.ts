import {baseApi} from '@/services/api/baseApi.ts';
import type {GetNotificationsPayload, InvitationItem, NotificationItem} from '@/types/api/Notification.ts';

const asRecord = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== 'object') return null;
    return value as Record<string, unknown>;
};

const readString = (source: Record<string, unknown> | null, keys: string[]): string | null => {
    if (!source) return null;

    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) {
            return value;
        }
    }

    return null;
};

const parsePayload = (raw: unknown): Record<string, unknown> | null => {
    if (typeof raw === 'string') {
        try {
            return asRecord(JSON.parse(raw));
        } catch {
            return null;
        }
    }

    return asRecord(raw);
};

const resolveSenderName = (sender: Record<string, unknown> | null): string | null => {
    if (!sender) return null;

    const direct = readString(sender, ['name', 'fullName', 'senderName', 'authorName']);
    if (direct) return direct;

    const firstName = readString(sender, ['firstName', 'FirstName']) ?? '';
    const lastName = readString(sender, ['lastName', 'LastName']) ?? '';
    const full = `${firstName} ${lastName}`.trim();

    return full || null;
};

const toArray = <T>(response: unknown): T[] => {
    if (Array.isArray(response)) {
        return response as T[];
    }

    if (!response || typeof response !== 'object') {
        return [];
    }

    const container = response as {result?: unknown; res?: unknown; data?: unknown};

    if (Array.isArray(container.result)) return container.result as T[];
    if (Array.isArray(container.res)) return container.res as T[];
    if (Array.isArray(container.data)) return container.data as T[];

    return [];
};

const mapNotification = (item: unknown): NotificationItem | null => {
    if (!item || typeof item !== 'object') return null;

    const source = item as Record<string, unknown>;
    const id = String(source.id ?? source.notificationId ?? '');
    if (!id) return null;

    const type = readString(source, ['type', 'Type']);
    const payload = parsePayload(source.payload);
    const payloadMessage = asRecord(payload?.message);
    const payloadSender = asRecord(payloadMessage?.sender ?? payloadMessage?.author);

    const eventId =
        readString(source, ['eventId', 'EventId'])
        ?? readString(payload, ['community_id', 'communityId', 'eventId', 'EventId'])
        ?? null;

    const communityName = readString(payload, ['community_name', 'communityName', 'eventName', 'EventName']);
    const messageText =
        readString(source, ['text', 'message'])
        ?? readString(payloadMessage, ['text', 'message'])
        ?? null;
    const senderName = resolveSenderName(payloadSender);

    const title =
        (source.title as string | null | undefined)
        ?? ((type?.toLowerCase() === 'chatmessage' && senderName) ? `Новое сообщение от ${senderName}` : null);

    return {
        id,
        title,
        text: messageText ?? '',
        isRead: Boolean(source.isRead ?? source.read),
        createdAt: String(source.createdAt ?? source.date ?? new Date().toISOString()),
        invitationId: (source.invitationId as string | null | undefined) ?? null,
        eventId,
        type,
        senderName,
        communityName,
        messageText,
    };
};

const mapInvitation = (item: unknown): InvitationItem | null => {
    if (!item || typeof item !== 'object') return null;

    const source = item as Record<string, unknown>;
    const id = String(source.id ?? source.invitationId ?? '');
    const eventId = String(source.eventId ?? '');
    if (!id || !eventId) return null;

    return {
        id,
        eventId,
        eventName: (source.eventName as string | null | undefined) ?? null,
        invitedByName: (source.invitedByName as string | null | undefined) ?? null,
        status: (source.status as string | undefined) ?? undefined,
        createdAt: (source.createdAt as string | undefined) ?? undefined,
    };
};

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationItem[], GetNotificationsPayload | void>({
            query: (params) => ({
                url: '/notifications',
                method: 'GET',
                params: params ?? undefined,
            }),
            transformResponse: (response: unknown) => toArray<unknown>(response)
                .map(mapNotification)
                .filter((item): item is NotificationItem => item !== null),
            providesTags: ['Notification'],
        }),
        markNotificationsRead: builder.mutation<void, string[]>({
            query: (notificationIds) => ({
                url: '/notifications/read',
                method: 'POST',
                body: notificationIds,
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsRead: builder.mutation<void, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'POST',
            }),
            invalidatesTags: ['Notification'],
        }),
        getInvitations: builder.query<InvitationItem[], void>({
            query: () => ({
                url: '/invitations',
                method: 'GET',
            }),
            transformResponse: (response: unknown) => toArray<unknown>(response)
                .map(mapInvitation)
                .filter((item): item is InvitationItem => item !== null),
            providesTags: ['Notification'],
        }),
        respondInvitation: builder.mutation<void, {invitationId: string; accept: boolean}>({
            query: ({invitationId, accept}) => ({
                url: `/invitations/${invitationId}/respond`,
                method: 'POST',
                params: {accept},
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkNotificationsReadMutation,
    useMarkAllNotificationsReadMutation,
    useGetInvitationsQuery,
    useRespondInvitationMutation,
} = notificationApi;
