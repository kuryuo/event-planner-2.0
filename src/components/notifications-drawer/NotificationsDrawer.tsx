import {useMemo, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import type {AppDispatch, RootState} from '@/store/store.ts';
import Button from '@/ui/button/Button.tsx';
import {
    useGetInvitationsQuery,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationsReadMutation,
    useRespondInvitationMutation,
} from '@/services/api/notificationApi.ts';
import {markAllChatAlertsRead, markChatAlertRead} from '@/store/realtimeSlice.ts';
import BellIcon from '@/assets/image/bell.svg?react';
import styles from './NotificationsDrawer.module.scss';

interface NotificationsDrawerProps {
    open: boolean;
    onClose: () => void;
}

type ViewNotification = {
    id: string;
    title: string;
    text: string;
    createdAt: string;
    isRead: boolean;
    invitationId?: string | null;
    isLocalChat?: boolean;
    eventId?: string;
};

const shortMessage = (value?: string): string => {
    if (!value) return 'Новое сообщение';
    return value.length > 120 ? `${value.slice(0, 120)}...` : value;
};

const resolveNotificationTitle = (type?: string | null, senderName?: string | null): string => {
    const normalized = String(type ?? '').toLowerCase();
    if (normalized === 'chatmessage') return `Новое сообщение${senderName ? ` от ${senderName}` : ''}`;
    if (normalized === 'eventstart') return 'Скоро начало мероприятия';
    if (normalized === 'bufferendingsoon') return 'Скоро завершится буферный период';
    if (normalized === 'taskdeadline') return 'Срок задачи';
    if (normalized === 'eventcancelled') return 'Мероприятие отменено';
    if (normalized === 'eventpublished') return 'Мероприятие опубликовано';
    return 'Уведомление';
};

const formatRelativeTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'только что';

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) return `${minutes} мин назад`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн назад`;

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
    }).format(date);
};

export default function NotificationsDrawer({open, onClose}: NotificationsDrawerProps) {
    const [shouldRender, setShouldRender] = useState(open);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {data: notifications = [], isLoading} = useGetNotificationsQuery(
        {count: 100, offset: 0},
        {skip: !open, refetchOnFocus: true, refetchOnReconnect: true, pollingInterval: 30000}
    );
    const {data: invitations = []} = useGetInvitationsQuery(undefined, {skip: !open});
    const chatAlerts = useSelector((state: RootState) => state.realtime.chatAlerts);
    const [markRead, {isLoading: isMarkingRead}] = useMarkNotificationsReadMutation();
    const [markAllRead, {isLoading: isMarkingAll}] = useMarkAllNotificationsReadMutation();
    const [respondInvitation, {isLoading: isResponding}] = useRespondInvitationMutation();

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            return;
        }

        const timer = window.setTimeout(() => {
            setShouldRender(false);
        }, 220);

        return () => window.clearTimeout(timer);
    }, [open]);

    const mergedNotifications = useMemo<ViewNotification[]>(() => {
        const apiItems: ViewNotification[] = notifications.map((notification) => ({
            id: notification.id,
            title: notification.title || resolveNotificationTitle(notification.type, notification.senderName),
            text: notification.type?.toLowerCase() === 'chatmessage'
                ? `${shortMessage(notification.messageText ?? notification.text)}${notification.communityName ? ` • ${notification.communityName}` : ''}`
                : notification.text,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            invitationId: notification.invitationId,
            eventId: notification.eventId ?? undefined,
        }));

        const chatItems: ViewNotification[] = chatAlerts.map((alert) => ({
            id: alert.id,
            title: alert.senderName ? `Новое сообщение от ${alert.senderName}` : 'Новое сообщение в чате',
            text: `${shortMessage(alert.messageText)}${alert.eventName ? ` • ${alert.eventName}` : ''}`,
            isRead: alert.isRead,
            createdAt: alert.createdAt,
            isLocalChat: true,
            eventId: alert.eventId,
        }));

        return [...apiItems, ...chatItems];
    }, [notifications, chatAlerts]);

    const invitationById = useMemo(() => {
        return new Map(invitations.map((invitation) => [invitation.id, invitation]));
    }, [invitations]);

    const sortedNotifications = useMemo(() => {
        return [...mergedNotifications].sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [mergedNotifications]);

    const unreadNotifications = useMemo(
        () => sortedNotifications.filter((notification) => !notification.isRead),
        [sortedNotifications]
    );

    const readNotifications = useMemo(
        () => sortedNotifications.filter((notification) => notification.isRead),
        [sortedNotifications]
    );

    const unreadCount = unreadNotifications.length;

    const handleRead = async (notification: ViewNotification) => {
        if (notification.isLocalChat) {
            dispatch(markChatAlertRead(notification.id));
            return;
        }

        try {
            await markRead([notification.id]).unwrap();
        } catch {
        }
    };

    const handleRespond = async (invitationId: string, accept: boolean) => {
        try {
            await respondInvitation({invitationId, accept}).unwrap();
        } catch {
        }
    };

    const handleOpenEvent = (notification: ViewNotification) => {
        if (!notification.eventId) return;
        if (notification.isLocalChat) {
            dispatch(markChatAlertRead(notification.id));
        }
        navigate(`/event?id=${notification.eventId}`);
        onClose();
    };

    if (!shouldRender) return null;

    return (
        <div className={`${styles.root} ${open ? styles.open : styles.closing}`}>
            <button type="button" className={styles.backdrop} aria-label="Закрыть уведомления" onClick={onClose} />
            <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Уведомления">
                <div className={styles.header}>
                    <h2 className={styles.title}>Уведомления</h2>
                    <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
                        ×
                    </button>
                </div>

                <div className={styles.headerActions}>
                    <span className={styles.counter}>Новые: {unreadCount}</span>
                    <Button
                        variant="Text"
                        color="default"
                        onClick={() => {
                            dispatch(markAllChatAlertsRead());
                            void markAllRead();
                        }}
                        disabled={unreadCount === 0 || isMarkingAll}
                    >
                        Прочитать все
                    </Button>
                </div>

                {isLoading ? (
                    <div className={styles.empty}>Загрузка уведомлений...</div>
                ) : sortedNotifications.length === 0 ? (
                    <div className={styles.empty}>Уведомлений пока нет</div>
                ) : (
                    <div className={styles.list}>
                        {unreadNotifications.length > 0 && <div className={styles.sectionTitle}>Новые</div>}
                        {unreadNotifications.map((notification) => {
                            const invitation = notification.invitationId
                                ? invitationById.get(notification.invitationId)
                                : undefined;

                            return (
                                <div key={notification.id} className={`${styles.card} ${styles.unread}`}>
                                    <div
                                        className={styles.cardMain}
                                        role={notification.eventId ? 'button' : undefined}
                                        tabIndex={notification.eventId ? 0 : undefined}
                                        onClick={() => notification.eventId && handleOpenEvent(notification)}
                                        onKeyDown={(event) => {
                                            if (!notification.eventId) return;
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleOpenEvent(notification);
                                            }
                                        }}
                                    >
                                        <div className={styles.cardIcon}><BellIcon /></div>
                                        <div className={styles.cardBody}>
                                            <div className={styles.cardTitleRow}>
                                                <div className={styles.cardTitle}>{notification.title}</div>
                                                <span className={styles.statusDot} aria-hidden="true" />
                                            </div>
                                            <div className={styles.cardText}>{notification.text}</div>
                                            <div className={styles.cardDate}>{formatRelativeTime(notification.createdAt)}</div>
                                        </div>
                                        <span className={styles.cardArrow} aria-hidden="true">→</span>
                                    </div>

                                    <div className={styles.cardControls}>
                                        <Button
                                            variant="Text"
                                            color="default"
                                            onClick={() => handleRead(notification)}
                                            disabled={isMarkingRead}
                                        >
                                            Отметить прочитанным
                                        </Button>
                                    </div>

                                    {invitation && (
                                        <div className={styles.invitationBlock}>
                                            <div className={styles.cardText}>
                                                Приглашение на мероприятие {invitation.eventName || invitation.eventId}
                                            </div>
                                            <div className={styles.actions}>
                                                <Button
                                                    variant="Filled"
                                                    color="purple"
                                                    onClick={() => handleRespond(invitation.id, true)}
                                                    disabled={isResponding}
                                                >
                                                    Принять
                                                </Button>
                                                <Button
                                                    variant="Text"
                                                    color="red"
                                                    onClick={() => handleRespond(invitation.id, false)}
                                                    disabled={isResponding}
                                                >
                                                    Отклонить
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {readNotifications.length > 0 && <div className={styles.sectionTitle}>Прочитанные</div>}
                        {readNotifications.map((notification) => (
                            <div key={notification.id} className={styles.card}>
                                <div
                                    className={styles.cardMain}
                                    role={notification.eventId ? 'button' : undefined}
                                    tabIndex={notification.eventId ? 0 : undefined}
                                    onClick={() => notification.eventId && handleOpenEvent(notification)}
                                    onKeyDown={(event) => {
                                        if (!notification.eventId) return;
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            handleOpenEvent(notification);
                                        }
                                    }}
                                >
                                    <div className={styles.cardIcon}><BellIcon /></div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardTitleRow}>
                                            <div className={styles.cardTitle}>{notification.title}</div>
                                        </div>
                                        <div className={styles.cardText}>{notification.text}</div>
                                        <div className={styles.cardDate}>{formatRelativeTime(notification.createdAt)}</div>
                                    </div>
                                    <span className={styles.cardArrow} aria-hidden="true">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </aside>
        </div>
    );
}
