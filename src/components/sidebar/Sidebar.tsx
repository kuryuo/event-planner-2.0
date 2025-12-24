import {Card} from '@/ui/card/Card.tsx';
import {Sublist} from '@/components/sidebar/sub-list/SubList.tsx';
import {NotificationBadge} from '@/ui/notification-badge/NotificationBadge.tsx';
import CircleButton from '@/ui/button-circle/ButtonCircle.tsx';
import bell from '@/assets/img/icon-l/bell.svg';
import styles from './Sidebar.module.scss';
import NextEvent from "@/components/sidebar/next-event/NextEvent.tsx";
import clsx from "clsx";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import {useGetProfileEventsQuery, useGetProfileQuery} from "@/services/api/profileApi.ts";
import {useNavigate} from "react-router-dom";
import {useMemo, useState, useEffect} from "react";
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useSubscribeToEventMutation, useUnsubscribeFromEventMutation, useGetEventByIdQuery} from "@/services/api/eventApi.ts";

interface SidebarProps {
    notificationCount?: number;
    isAdmin?: boolean;
}

export default function Sidebar({notificationCount = 3, isAdmin = false}: SidebarProps) {
    const {data: profile} = useGetProfileQuery();
    const {data: events} = useGetProfileEventsQuery();
    const navigate = useNavigate();
    const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=50';
    const [subscribeToEvent] = useSubscribeToEventMutation();
    const [unsubscribeFromEvent] = useUnsubscribeFromEventMutation();
    const [savedNextEventId, setSavedNextEventId] = useState<string | null>(null);

    const subscriptions = (events ?? []).map((event) => ({
        title: event.name,
        subtitle: event.location ?? '',
        avatarUrl: buildImageUrl(event.avatar) ?? fallbackAvatar,
        onClick: () => navigate(`/event?id=${event.id}`),
    }));

    // Находим ближайшее мероприятие (с startDate в будущем)
    const nextEventFromSubscriptions = useMemo(() => {
        if (!events || events.length === 0) return null;
        
        const now = new Date();
        const upcomingEvents = events
            .filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate >= now;
            })
            .sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return dateA.getTime() - dateB.getTime();
            });

        return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
    }, [events]);

    // Сохраняем ID ближайшего мероприятия при первом обнаружении
    useEffect(() => {
        if (nextEventFromSubscriptions && !savedNextEventId) {
            setSavedNextEventId(nextEventFromSubscriptions.id);
        }
    }, [nextEventFromSubscriptions, savedNextEventId]);

    // Получаем данные о сохраненном мероприятии, если оно не в подписках
    const {data: savedEventData} = useGetEventByIdQuery(
        savedNextEventId ?? '',
        {skip: !savedNextEventId || !!nextEventFromSubscriptions}
    );

    // Определяем, какое мероприятие показывать
    const nextEvent = nextEventFromSubscriptions || savedEventData?.result || null;

    // Проверяем, подписан ли пользователь на ближайшее мероприятие
    const isSubscribedToNextEvent = useMemo(() => {
        if (!nextEvent || !events) return false;
        // Если мероприятие есть в списке подписок, значит пользователь подписан
        return events.some(event => event.id === nextEvent.id);
    }, [nextEvent, events]);

    // Проверяем, что мероприятие еще не прошло
    const isEventUpcoming = useMemo(() => {
        if (!nextEvent) return false;
        const eventDate = new Date(nextEvent.startDate);
        return eventDate >= new Date();
    }, [nextEvent]);

    // Форматируем дату для отображения
    const formattedNextEventDate = useMemo(() => {
        if (!nextEvent) return '';
        
        const startDate = new Date(nextEvent.startDate);
        const endDate = new Date(nextEvent.endDate);
        
        // Если даты в один день: "10 ноября, 19:00"
        // Если в разные дни: "10 ноября 19:00 - 11 ноября 20:00"
        const isSameDay = startDate.getDate() === endDate.getDate() &&
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getFullYear() === endDate.getFullYear();

        if (isSameDay) {
            const datePart = format(startDate, "d MMMM", {locale: ru});
            const timePart = format(startDate, "HH:mm", {locale: ru});
            return `${datePart}, ${timePart}`;
        } else {
            const startFormatted = format(startDate, "d MMMM HH:mm", {locale: ru});
            const endFormatted = format(endDate, "d MMMM HH:mm", {locale: ru});
            return `${startFormatted} - ${endFormatted}`;
        }
    }, [nextEvent]);

    const handleCreateEvent = () => {
        navigate("/editor");
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const handleNextEventDetails = () => {
        if (nextEvent) {
            navigate(`/event?id=${nextEvent.id}`);
        }
    };

    const handleNextEventAttend = async () => {
        if (!nextEvent) return;
        
        try {
            if (isSubscribedToNextEvent) {
                await unsubscribeFromEvent(nextEvent.id).unwrap();
            } else {
                await subscribeToEvent(nextEvent.id).unwrap();
            }
        } catch (error) {
            console.error('Ошибка при подписке/отписке:', error);
        }
    };

    // Закомментировано до реализации функционала уведомлений
    // const cardRightIcon = (
    //     <NotificationBadge icon={<img src={bell} alt="Уведомления"/>} count={notificationCount}/>
    // );
    // const handleRightIconClick = () => console.log('Открыть уведомления');

    return (
        <div className={styles.sidebar}>
            <div className={styles.block}>
                <div onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                    <Card
                        title={`${profile?.lastName ?? ''} ${profile?.firstName ?? ''} ${profile?.middleName ?? ''}`.trim()}
                        avatarUrl={
                            profile?.avatarUrl
                                ? buildImageUrl(profile.avatarUrl)!
                                : fallbackAvatar
                        }
                        // rightIcon={cardRightIcon}
                        // onRightIconClick={handleRightIconClick}
                    />
                </div>
            </div>

            {isAdmin && (
                <div className={clsx(styles.block, styles.createEventWrapper)}>
                    <CircleButton onClick={handleCreateEvent} variant={"green"}/>
                    <span className={styles.createEventText}>Создайте мероприятие</span>
                </div>
            )}

            {nextEvent && isEventUpcoming && (
                <div className={styles.block}>
                    <NextEvent
                        title={nextEvent.name}
                        date={formattedNextEventDate}
                        isSubscribed={isSubscribedToNextEvent}
                        onAttend={handleNextEventAttend}
                        onDetails={handleNextEventDetails}
                    />
                </div>
            )}

            <div className={styles.block}>
                <Sublist items={subscriptions}/>
            </div>
        </div>
    );
}
