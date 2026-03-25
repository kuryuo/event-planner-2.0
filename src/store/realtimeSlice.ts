import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export interface ChatAlert {
    id: string;
    eventId: string;
    eventName?: string;
    senderName?: string;
    messageText?: string;
    createdAt: string;
    isRead: boolean;
}

interface RealtimeState {
    chatAlerts: ChatAlert[];
}

const initialState: RealtimeState = {
    chatAlerts: [],
};

const buildAlertId = (eventId: string, messageId?: string, createdAt?: string): string => {
    if (messageId) return `chat-${eventId}-${messageId}`;
    if (createdAt) return `chat-${eventId}-${createdAt}`;
    return `chat-${eventId}-${Date.now()}`;
};

export const realtimeSlice = createSlice({
    name: 'realtime',
    initialState,
    reducers: {
        pushChatAlert: (
            state,
            action: PayloadAction<{
                eventId: string;
                messageId?: string;
                eventName?: string;
                senderName?: string;
                messageText?: string;
                createdAt?: string;
            }>
        ) => {
            const {eventId, messageId, eventName, senderName, messageText, createdAt} = action.payload;
            if (!eventId) return;

            const id = buildAlertId(eventId, messageId, createdAt);
            const existing = state.chatAlerts.find((alert) => alert.id === id);

            if (existing) {
                existing.isRead = false;
                existing.createdAt = createdAt ?? new Date().toISOString();
                if (eventName) existing.eventName = eventName;
                if (senderName) existing.senderName = senderName;
                if (typeof messageText === 'string') existing.messageText = messageText;
                return;
            }

            state.chatAlerts.unshift({
                id,
                eventId,
                eventName,
                senderName,
                messageText,
                createdAt: createdAt ?? new Date().toISOString(),
                isRead: false,
            });
        },
        markChatAlertRead: (state, action: PayloadAction<string>) => {
            const target = state.chatAlerts.find((alert) => alert.id === action.payload);
            if (target) target.isRead = true;
        },
        markAllChatAlertsRead: (state) => {
            state.chatAlerts.forEach((alert) => {
                alert.isRead = true;
            });
        },
        clearEventChatUnread: (state, action: PayloadAction<string>) => {
            const eventId = action.payload;
            state.chatAlerts.forEach((alert) => {
                if (alert.eventId === eventId) {
                    alert.isRead = true;
                }
            });
        },
    },
});

export const {
    pushChatAlert,
    markChatAlertRead,
    markAllChatAlertsRead,
    clearEventChatUnread,
} = realtimeSlice.actions;

export default realtimeSlice.reducer;
