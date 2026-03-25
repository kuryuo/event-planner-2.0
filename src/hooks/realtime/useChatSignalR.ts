import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '@/store/store.ts';
import {baseApi} from '@/services/api/baseApi.ts';
import {
    CHAT_EVENT_NAMES,
    CHAT_HUB_URL,
    createHubConnection,
    extractEventId,
    resolveHubUrl,
    signalRDebug,
    startHubConnection,
} from '@/services/realtime/signalr.ts';

export const useChatSignalR = (eventId: string): void => {
    const dispatch = useDispatch<AppDispatch>();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        if (!eventId || !accessToken) {
            return;
        }

        const connection = createHubConnection(resolveHubUrl(CHAT_HUB_URL), () => accessToken);
        let isCancelled = false;

        signalRDebug('Init chat hub', {hubUrl: resolveHubUrl(CHAT_HUB_URL), eventId});

        connection.onclose((error) => {
            signalRDebug('Chat hub closed', error ?? '(no error)');
        });

        const invalidateChat = () => {
            dispatch(baseApi.util.invalidateTags([{type: 'Chat', id: eventId}]));
        };

        const handleIncoming = (payload: unknown) => {
            signalRDebug('Chat event payload', payload);
            const payloadEventId = extractEventId(payload);
            if (payloadEventId && payloadEventId !== eventId) {
                signalRDebug('Skip payload from another event', {payloadEventId, eventId});
                return;
            }

            signalRDebug('Invalidate chat tag', eventId);
            invalidateChat();
        };

        CHAT_EVENT_NAMES.forEach((eventName) => {
            connection.on(eventName, handleIncoming);
        });

        connection.onreconnected(async () => {
            signalRDebug('Chat hub reconnected -> rejoin event', eventId);
            try {
                await connection.invoke('JoinEvent', eventId);
                signalRDebug('Rejoined chat event', eventId);
            } catch {
                signalRDebug('Failed to rejoin chat event', eventId);
            }
            invalidateChat();
        });

        void (async () => {
            const started = await startHubConnection(connection);
            if (!started || isCancelled) {
                return;
            }

            try {
                await connection.invoke('JoinEvent', eventId);
                signalRDebug('Joined chat event', eventId);
            } catch {
                signalRDebug('Failed to join chat event', eventId);
            }
        })();

        return () => {
            isCancelled = true;

            CHAT_EVENT_NAMES.forEach((eventName) => {
                connection.off(eventName, handleIncoming);
            });

            void (async () => {
                try {
                    await connection.invoke('LeaveEvent', eventId);
                    signalRDebug('Left chat event', eventId);
                } catch {
                    // Игнорируем: соединение может уже быть разорвано.
                }
                await connection.stop();
                signalRDebug('Chat hub stopped');
            })();
        };
    }, [accessToken, dispatch, eventId]);
};
