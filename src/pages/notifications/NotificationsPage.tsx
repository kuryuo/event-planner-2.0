import {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '@/store/store.ts';
import { AppShell } from '@/components/app-shell/AppShell';
import {Button} from "antd";
import {
    useGetInvitationsQuery,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationsReadMutation,
    useRespondInvitationMutation,
} from '@/services/api/notificationApi.ts';
import styles from './NotificationsPage.module.scss';
import {markAllChatAlertsRead, markChatAlertRead} from '@/store/realtimeSlice.ts';
import BellIcon from '@/assets/image/bell.svg?react';
import {useI18n} from '@/i18n/I18nProvider';

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

const shortMessage = (value: string | undefined, fallback: string): string => {
    if (!value) return fallback;
    return value.length > 120 ? `${value.slice(0, 120)}...` : value;
};

const resolveNotificationTitle = (
    t: (key: string, params?: Record<string, string | number>) => string,
    type?: string | null,
    senderName?: string | null,
): string => {
    const normalized = String(type ?? '').toLowerCase();
    if (normalized === 'chatmessage') return senderName ? t('notifications.newMessageFrom', {name: senderName}) : t('notifications.newMessage');
    if (normalized === 'eventstart') return t('notifications.eventStartSoon');
    if (normalized === 'bufferendingsoon') return t('notifications.bufferEndingSoon');
    if (normalized === 'taskdeadline') return t('notifications.taskDeadline');
    if (normalized === 'eventcancelled') return t('notifications.eventCancelled');
    if (normalized === 'eventpublished') return t('notifications.eventPublished');
    return t('notifications.title');
};

const formatRelativeTime = (
    value: string,
    language: 'ru' | 'en',
    t: (key: string, params?: Record<string, string | number>) => string,
): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('common.status.justNow');

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) {
        return t('common.relative.minutesAgo', {count: minutes});
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return t('common.relative.hoursAgo', {count: hours});
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return t('common.relative.daysAgo', {count: days});
    }

    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
    }).format(date);
};

export default function NotificationsPage() {
    const {t, language} = useI18n();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {data: notifications = [], isLoading} = useGetNotificationsQuery(
        {count: 100, offset: 0},
        {refetchOnFocus: true, refetchOnReconnect: true, pollingInterval: 30000}
    );
    const {data: invitations = []} = useGetInvitationsQuery();
    const chatAlerts = useSelector((state: RootState) => state.realtime.chatAlerts);
    const [markRead, {isLoading: isMarkingRead}] = useMarkNotificationsReadMutation();
    const [markAllRead, {isLoading: isMarkingAll}] = useMarkAllNotificationsReadMutation();
    const [respondInvitation, {isLoading: isResponding}] = useRespondInvitationMutation();

    const mergedNotifications = useMemo<ViewNotification[]>(() => {
        const apiItems: ViewNotification[] = notifications.map((notification) => ({
            id: notification.id,
            title: notification.title || resolveNotificationTitle(t, notification.type, notification.senderName),
            text: notification.type?.toLowerCase() === 'chatmessage'
                ? `${shortMessage(notification.messageText ?? notification.text, t('notifications.newMessage'))}${notification.communityName ? ` • ${notification.communityName}` : ''}`
                : notification.text,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            invitationId: notification.invitationId,
            eventId: notification.eventId ?? undefined,
        }));

        const chatItems: ViewNotification[] = chatAlerts.map((alert) => ({
            id: alert.id,
            title: alert.senderName ? t('notifications.newMessageFrom', {name: alert.senderName}) : t('notifications.newChatMessage'),
            text: `${shortMessage(alert.messageText, t('notifications.newMessage'))}${alert.eventName ? ` • ${alert.eventName}` : ''}`,
            isRead: alert.isRead,
            createdAt: alert.createdAt,
            isLocalChat: true,
            eventId: alert.eventId,
        }));

        return [...apiItems, ...chatItems];
    }, [notifications, chatAlerts, t]);

    const unreadCount = useMemo(
        () => mergedNotifications.filter(item => !item.isRead).length,
        [mergedNotifications]
    );

    const invitationById = useMemo(() => {
        return new Map(invitations.map(invitation => [invitation.id, invitation]));
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

    const handleRead = async (notification: ViewNotification) => {
        if (notification.isLocalChat) {
            dispatch(markChatAlertRead(notification.id));
            return;
        }

        try {
            await markRead([notification.id]).unwrap();
        } catch (error) {
            console.error(t('notifications.markReadFailed'), error);
        }
    };

    const handleRespond = async (invitationId: string, accept: boolean) => {
        try {
            await respondInvitation({invitationId, accept}).unwrap();
        } catch (error) {
            console.error(t('notifications.invitationRespondFailed'), error);
        }
    };

    const handleOpenChat = (notification: ViewNotification) => {
        if (!notification.eventId) return;
        if (notification.isLocalChat) {
            dispatch(markChatAlertRead(notification.id));
        }
        navigate(`/event?id=${notification.eventId}`);
    };

    return (
        <AppShell
            pageWrapperClassName={styles.pageWrapper}
            sidebarColumnClassName={styles.sidebar}
            sidebarProps={{ notificationCount: unreadCount }}
        >
            <div className={styles.contentArea}>
                <div className={styles.content}>
                <div className={styles.header}>
                    <h2>{t('notifications.title')}</h2>
                    <div className={styles.actions}>
                        <Button type="text" className="ep-btn ep-btn--m ep-btn--text" onClick={() => navigate(-1)}>
                            {t('common.actions.back')}
                        </Button>
                        <Button
                            type="default"
                            className="ep-btn ep-btn--m ep-btn--filled-gray"
                            onClick={() => {
                                dispatch(markAllChatAlertsRead());
                                void markAllRead();
                            }}
                            disabled={unreadCount === 0 || isMarkingAll}
                        >
                            {t('common.actions.markAllRead')}
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.empty}>{t('notifications.loading')}</div>
                ) : sortedNotifications.length === 0 ? (
                    <div className={styles.empty}>{t('notifications.empty')}</div>
                ) : (
                    <div className={styles.list}>
                        {unreadNotifications.length > 0 && (
                            <div className={styles.sectionTitle}>{t('notifications.unreadSection')}</div>
                        )}

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
                                        onClick={() => notification.eventId && handleOpenChat(notification)}
                                        onKeyDown={(event) => {
                                            if (!notification.eventId) return;
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleOpenChat(notification);
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
                                            <div className={styles.cardDate}>{formatRelativeTime(notification.createdAt, language, t)}</div>
                                        </div>
                                        <span className={styles.cardArrow} aria-hidden="true">→</span>
                                    </div>

                                    <div className={styles.cardControls}>
                                        <Button
                                            type="text"
                                            className="ep-btn ep-btn--m ep-btn--text"
                                            onClick={() => handleRead(notification)}
                                            disabled={isMarkingRead}
                                        >
                                            {t('common.actions.markAsRead')}
                                        </Button>
                                    </div>

                                    {invitation && (
                                        <div className={styles.invitationBlock}>
                                            <div className={styles.cardText}>
                                                {t('notifications.invitationToEvent', {name: invitation.eventName || invitation.eventId})}
                                            </div>
                                            <div className={styles.actions}>
                                                <Button
                                                    type="primary"
                                                    className="ep-btn ep-btn--m ep-btn--filled-purple"
                                                    onClick={() => handleRespond(invitation.id, true)}
                                                    disabled={isResponding}
                                                >
                                                    {t('common.actions.accept')}
                                                </Button>
                                                <Button
                                                    type="text"
                                                    danger
                                                    className="ep-btn ep-btn--m ep-btn--text"
                                                    onClick={() => handleRespond(invitation.id, false)}
                                                    disabled={isResponding}
                                                >
                                                    {t('common.actions.decline')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {readNotifications.length > 0 && (
                            <div className={styles.sectionTitle}>{t('notifications.readSection')}</div>
                        )}

                        {readNotifications.map((notification) => (
                            <div key={notification.id} className={styles.card}>
                                <div
                                    className={styles.cardMain}
                                    role={notification.eventId ? 'button' : undefined}
                                    tabIndex={notification.eventId ? 0 : undefined}
                                    onClick={() => notification.eventId && handleOpenChat(notification)}
                                    onKeyDown={(event) => {
                                        if (!notification.eventId) return;
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            handleOpenChat(notification);
                                        }
                                    }}
                                >
                                    <div className={styles.cardIcon}><BellIcon /></div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardTitleRow}>
                                            <div className={styles.cardTitle}>{notification.title}</div>
                                        </div>
                                        <div className={styles.cardText}>{notification.text}</div>
                                        <div className={styles.cardDate}>{formatRelativeTime(notification.createdAt, language, t)}</div>
                                    </div>
                                    <span className={styles.cardArrow} aria-hidden="true">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </AppShell>
    );
}
