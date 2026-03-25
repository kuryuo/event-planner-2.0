import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '@/store/store.ts';
import {baseApi} from '@/services/api/baseApi.ts';
import {pushChatAlert} from '@/store/realtimeSlice.ts';
import {
    createHubConnection,
    extractChatNotificationMeta,
    NOTIFICATION_EVENT_NAMES,
    NOTIFICATIONS_HUB_URL,
    resolveHubUrl,
    signalRDebug,
    startHubConnection,
} from '@/services/realtime/signalr.ts';

export const useNotificationsSignalR = (): void => {
    const dispatch = useDispatch<AppDispatch>();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const connection = createHubConnection(resolveHubUrl(NOTIFICATIONS_HUB_URL), () => accessToken);
        let isCancelled = false;

        signalRDebug('Init notifications hub', resolveHubUrl(NOTIFICATIONS_HUB_URL));

        connection.onclose((error) => {
            signalRDebug('Notifications hub closed', error ?? '(no error)');
        });

        const invalidateNotifications = () => {
            dispatch(baseApi.util.invalidateTags(['Notification']));
        };

        const handleIncoming = (payload: unknown) => {
            signalRDebug('Notification payload', payload);

            const source = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : null;
            const type = String(source?.type ?? source?.Type ?? '').toLowerCase();

            const {
                eventId,
                messageId,
                eventName,
                senderName,
                messageText,
                createdAt,
            } = extractChatNotificationMeta(payload);

            const looksLikeChat = type === 'chatmessage' || Boolean(messageText && senderName);

            if (looksLikeChat && eventId) {
                dispatch(pushChatAlert({
                    eventId,
                    messageId,
                    eventName,
                    senderName,
                    messageText,
                    createdAt,
                }));

                signalRDebug('Chat notification saved from Notifications hub', {
                    eventId,
                    eventName: eventName || '(unknown event)',
                    senderName: senderName || '(unknown sender)',
                });
            } else if (looksLikeChat) {
                signalRDebug('Notification looks like chat but no eventId/community_id');
            }

            signalRDebug('Notification received -> invalidating Notification tag');
            invalidateNotifications();
        };

        NOTIFICATION_EVENT_NAMES.forEach((eventName) => {
            connection.on(eventName, handleIncoming);
        });

        connection.onreconnected(() => {
            signalRDebug('Notifications hub reconnected -> invalidating Notification tag');
            invalidateNotifications();
        });

        void (async () => {
            const started = await startHubConnection(connection);
            if (!started || isCancelled) {
                signalRDebug('Notifications hub not started or disposed', {started, isCancelled});
                return;
            }

            signalRDebug('Notifications hub is active');
        })();

        return () => {
            isCancelled = true;

            NOTIFICATION_EVENT_NAMES.forEach((eventName) => {
                connection.off(eventName, handleIncoming);
            });

            void (async () => {
                await connection.stop();
                signalRDebug('Notifications hub stopped');
            })();
        };
    }, [accessToken, dispatch]);
};
