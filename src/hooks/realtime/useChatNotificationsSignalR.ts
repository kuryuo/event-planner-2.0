import {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '@/store/store.ts';
import {pushChatAlert} from '@/store/realtimeSlice.ts';
import {
    CHAT_HUB_URL,
    createHubConnection,
    extractChatNotificationMeta,
    resolveHubUrl,
    signalRDebug,
    startHubConnection,
} from '@/services/realtime/signalr.ts';

interface EventMeta {
    id: string;
    name: string;
}

export const useChatNotificationsSignalR = (events: EventMeta[]): void => {
    const dispatch = useDispatch<AppDispatch>();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);

    const eventNameById = useMemo(() => {
        return new Map(events.map((event) => [event.id, event.name]));
    }, [events]);

    useEffect(() => {
        if (!accessToken || events.length === 0) return;

        const connection = createHubConnection(resolveHubUrl(CHAT_HUB_URL), () => accessToken);
        let isDisposed = false;

        signalRDebug('Init chat notifications hub', {
            hubUrl: resolveHubUrl(CHAT_HUB_URL),
            eventsCount: events.length,
        });

        connection.onclose((error) => {
            signalRDebug('Chat notifications hub closed', error ?? '(no error)');
        });

        const joinAllEvents = async () => {
            for (const event of events) {
                try {
                    await connection.invoke('JoinEvent', event.id);
                    signalRDebug('Joined chat event', {eventId: event.id, eventName: event.name});
                } catch {
                    signalRDebug('Failed to join chat event', {eventId: event.id, eventName: event.name});
                }
            }
        };

        const leaveAllEvents = async () => {
            for (const event of events) {
                try {
                    await connection.invoke('LeaveEvent', event.id);
                    signalRDebug('Left chat event', {eventId: event.id});
                } catch {
                    // Ignore disconnect race.
                }
            }
        };

        const onMessageReceived = (payload: unknown) => {
            signalRDebug('Chat notification payload', payload);
            const {
                eventId,
                messageId,
                eventName: payloadEventName,
                senderName,
                messageText,
                createdAt,
            } = extractChatNotificationMeta(payload);
            if (!eventId) {
                signalRDebug('Skip chat notification: no eventId/community_id in payload');
                return;
            }

            const source = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : null;
            const eventName = eventNameById.get(eventId)
                || payloadEventName
                || String(source?.eventName ?? source?.EventName ?? '');

            dispatch(pushChatAlert({
                eventId,
                messageId,
                eventName: eventName || undefined,
                senderName,
                messageText,
                createdAt: createdAt ?? String(source?.createdAt ?? source?.CreatedAt ?? new Date().toISOString()),
            }));

            signalRDebug('Chat notification saved to sidebar', {
                eventId,
                eventName: eventName || '(unknown event)',
                senderName: senderName || '(unknown sender)',
            });
        };

        connection.on('MessageReceived', onMessageReceived);

        connection.onreconnected(async () => {
            signalRDebug('Chat notifications hub reconnected -> rejoin all events');
            await joinAllEvents();
        });

        void (async () => {
            const started = await startHubConnection(connection);
            if (!started || isDisposed) return;
            await joinAllEvents();
            signalRDebug('Chat notifications hub is active');
        })();

        return () => {
            isDisposed = true;
            connection.off('MessageReceived', onMessageReceived);

            void (async () => {
                await leaveAllEvents();
                await connection.stop();
                signalRDebug('Chat notifications hub stopped');
            })();
        };
    }, [accessToken, dispatch, eventNameById, events]);
};
