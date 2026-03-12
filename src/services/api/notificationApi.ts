import {baseApi} from '@/services/api/baseApi.ts';
import type {GetNotificationsPayload, InvitationItem, NotificationItem} from '@/types/api/Notification.ts';

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

    return {
        id,
        title: (source.title as string | null | undefined) ?? null,
        text: String(source.text ?? source.message ?? ''),
        isRead: Boolean(source.isRead ?? source.read),
        createdAt: String(source.createdAt ?? source.date ?? new Date().toISOString()),
        invitationId: (source.invitationId as string | null | undefined) ?? null,
        eventId: (source.eventId as string | null | undefined) ?? null,
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
