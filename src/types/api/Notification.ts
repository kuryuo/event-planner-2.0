export interface NotificationItem {
    id: string;
    title?: string | null;
    text: string;
    isRead: boolean;
    createdAt: string;
    invitationId?: string | null;
    eventId?: string | null;
    type?: string | null;
    senderName?: string | null;
    communityName?: string | null;
    messageText?: string | null;
}

export interface GetNotificationsPayload {
    count?: number;
    offset?: number;
}

export interface InvitationItem {
    id: string;
    eventId: string;
    eventName?: string | null;
    invitedByName?: string | null;
    status?: string;
    createdAt?: string;
}
