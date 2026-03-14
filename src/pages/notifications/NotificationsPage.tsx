import {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import Sidebar from '@/components/sidebar/Sidebar.tsx';
import Button from '@/ui/button/Button.tsx';
import {
    useGetInvitationsQuery,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationsReadMutation,
    useRespondInvitationMutation,
} from '@/services/api/notificationApi.ts';
import styles from './NotificationsPage.module.scss';

const formatDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const {data: notifications = [], isLoading} = useGetNotificationsQuery({count: 100, offset: 0});
    const {data: invitations = []} = useGetInvitationsQuery();
    const [markRead, {isLoading: isMarkingRead}] = useMarkNotificationsReadMutation();
    const [markAllRead, {isLoading: isMarkingAll}] = useMarkAllNotificationsReadMutation();
    const [respondInvitation, {isLoading: isResponding}] = useRespondInvitationMutation();

    const unreadCount = useMemo(() => notifications.filter(item => !item.isRead).length, [notifications]);

    const invitationById = useMemo(() => {
        return new Map(invitations.map(invitation => [invitation.id, invitation]));
    }, [invitations]);

    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => {
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [notifications]);

    const handleRead = async (notificationId: string) => {
        try {
            await markRead([notificationId]).unwrap();
        } catch (error) {
            console.error('Не удалось отметить уведомление прочитанным', error);
        }
    };

    const handleRespond = async (invitationId: string, accept: boolean) => {
        try {
            await respondInvitation({invitationId, accept}).unwrap();
        } catch (error) {
            console.error('Не удалось ответить на приглашение', error);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={unreadCount}/>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h2>Уведомления</h2>
                    <div className={styles.actions}>
                        <Button variant="Text" color="default" onClick={() => navigate(-1)}>
                            Назад
                        </Button>
                        <Button
                            variant="Filled"
                            color="gray"
                            onClick={() => markAllRead()}
                            disabled={unreadCount === 0 || isMarkingAll}
                        >
                            Прочитать все
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.empty}>Загрузка уведомлений...</div>
                ) : sortedNotifications.length === 0 ? (
                    <div className={styles.empty}>Уведомлений пока нет</div>
                ) : (
                    <div className={styles.list}>
                        {sortedNotifications.map(notification => {
                            const invitation = notification.invitationId
                                ? invitationById.get(notification.invitationId)
                                : undefined;

                            return (
                                <div
                                    key={notification.id}
                                    className={notification.isRead ? styles.card : `${styles.card} ${styles.unread}`}
                                >
                                    <div className={styles.cardTop}>
                                        <div>
                                            <div className={styles.cardTitle}>{notification.title || 'Уведомление'}</div>
                                            <div className={styles.cardText}>{notification.text}</div>
                                        </div>
                                        <div className={styles.cardDate}>{formatDate(notification.createdAt)}</div>
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

                                    {!notification.isRead && (
                                        <Button
                                            variant="Text"
                                            color="default"
                                            onClick={() => handleRead(notification.id)}
                                            disabled={isMarkingRead}
                                        >
                                            Отметить прочитанным
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
