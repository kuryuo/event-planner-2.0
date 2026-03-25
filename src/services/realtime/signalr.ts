import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    HttpTransportType,
    LogLevel,
} from '@microsoft/signalr';

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cpbeventplanner.ru';
const SIGNALR_DEBUG_ENABLED = import.meta.env.DEV;

export const CHAT_HUB_URL = import.meta.env.VITE_SIGNALR_CHAT_HUB_URL || '/hubs/chat';
export const NOTIFICATIONS_HUB_URL = import.meta.env.VITE_SIGNALR_NOTIFICATIONS_HUB_URL || '/hubs/notifications';

export const CHAT_EVENT_NAMES = [
    'MessageReceived',
    'MessageUpdated',
    'MessageDeleted',
] as const;

export const NOTIFICATION_EVENT_NAMES = [
    'NotificationReceived',
] as const;

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

export const resolveHubUrl = (urlOrPath: string): string => {
    if (/^https?:\/\//i.test(urlOrPath)) {
        return urlOrPath;
    }

    return `${normalizeBaseUrl(DEFAULT_BASE_URL)}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;
};

export const signalRDebug = (...args: unknown[]): void => {
    if (!SIGNALR_DEBUG_ENABLED) return;
    console.info('[SignalR]', ...args);
};

export const createHubConnection = (hubUrl: string, accessTokenFactory: () => string | null): HubConnection => {
    return new HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => accessTokenFactory() || '',
            withCredentials: false,
            transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(LogLevel.None)
        .build();
};

export const startHubConnection = async (connection: HubConnection): Promise<boolean> => {
    if (connection.state === HubConnectionState.Connected || connection.state === HubConnectionState.Connecting) {
        signalRDebug('Skip start: already connected/connecting', connection.state);
        return true;
    }

    try {
        await connection.start();
        signalRDebug('Connection started', connection.connectionId ?? '(no connectionId)');
        return true;
    } catch (error) {
        signalRDebug('Connection start failed', error);
        return false;
    }
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== 'object') return null;
    return value as Record<string, unknown>;
};

const readString = (source: Record<string, unknown> | null, keys: string[]): string | undefined => {
    if (!source) return undefined;

    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim()) {
            return value;
        }
    }

    return undefined;
};

const parseEnvelopePayload = (payload: unknown): Record<string, unknown> | null => {
    const source = asRecord(payload);
    if (!source) return null;

    const raw = source.payload;
    if (typeof raw === 'string') {
        try {
            return asRecord(JSON.parse(raw));
        } catch {
            return null;
        }
    }

    return asRecord(raw);
};

const resolveSenderName = (sender: Record<string, unknown> | null): string | undefined => {
    if (!sender) return undefined;

    const explicitName = readString(sender, ['name', 'fullName', 'authorName', 'senderName']);
    if (explicitName) return explicitName;

    const firstName = readString(sender, ['firstName', 'FirstName']) ?? '';
    const lastName = readString(sender, ['lastName', 'LastName']) ?? '';
    const composedName = `${firstName} ${lastName}`.trim();

    return composedName || undefined;
};

export interface ChatNotificationMeta {
    eventId: string | null;
    messageId?: string;
    eventName?: string;
    senderName?: string;
    messageText?: string;
    createdAt?: string;
}

export const extractChatNotificationMeta = (payload: unknown): ChatNotificationMeta => {
    const source = asRecord(payload);
    if (!source) {
        return {eventId: null};
    }

    const envelope = parseEnvelopePayload(payload);
    const envelopeMessage = asRecord(envelope?.message);
    const senderFromSource = asRecord(source.sender ?? source.author);
    const senderFromEnvelope = asRecord(envelopeMessage?.sender ?? envelopeMessage?.author);

    const eventId =
        readString(source, ['eventId', 'EventId', 'chatEventId', 'ChatEventId', 'communityId', 'community_id'])
        ?? readString(envelope, ['eventId', 'EventId', 'chatEventId', 'ChatEventId', 'communityId', 'community_id'])
        ?? readString(envelopeMessage, ['eventId', 'EventId', 'chatEventId', 'ChatEventId', 'communityId', 'community_id'])
        ?? null;

    const messageId =
        readString(source, ['id', 'messageId', 'MessageId'])
        ?? readString(envelopeMessage, ['id', 'messageId', 'MessageId'])
        ?? readString(envelope, ['id', 'messageId', 'MessageId'])
        ?? undefined;

    const eventName =
        readString(source, ['eventName', 'EventName', 'communityName', 'community_name'])
        ?? readString(envelope, ['eventName', 'EventName', 'communityName', 'community_name']);

    const messageText =
        readString(source, ['text', 'message'])
        ?? readString(envelopeMessage, ['text', 'message']);

    const senderName = resolveSenderName(senderFromSource) ?? resolveSenderName(senderFromEnvelope);

    const createdAt =
        readString(source, ['createdAt', 'CreatedAt'])
        ?? readString(envelopeMessage, ['createdAt', 'CreatedAt'])
        ?? readString(envelope, ['createdAt', 'CreatedAt']);

    return {
        eventId,
        messageId,
        eventName,
        senderName,
        messageText,
        createdAt,
    };
};

export const extractEventId = (payload: unknown): string | null => {
    return extractChatNotificationMeta(payload).eventId;
};
