import {Card} from '@/ui/card/Card.tsx';
import {Sublist} from '@/components/sidebar/sub-list/SubList.tsx';
import CircleButton from '@/ui/button-circle/ButtonCircle.tsx';
import styles from './Sidebar.module.scss';
import NextEvent from "@/components/sidebar/next-event/NextEvent.tsx";
import clsx from "clsx";
import {buildImageUrl} from "@/utils/buildImageUrl.ts";
import {useGetProfileEventsQuery, useGetProfileQuery} from "@/services/api/profileApi.ts";
import {useNavigate} from "react-router-dom";
import {useMemo, useState, useEffect} from "react";
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {
    useSubscribeToEventMutation,
    useUnsubscribeFromEventMutation,
    useGetEventByIdQuery,
    useGetEventsQuery
} from "@/services/api/eventApi.ts";

interface SidebarProps {
    notificationCount?: number;
    isAdmin?: boolean;
}

export default function Sidebar({notificationCount: _notificationCount = 3, isAdmin: _isAdmin = false}: SidebarProps) {
    const {data: profile} = useGetProfileQuery();
    const {data: subscribedEvents} = useGetProfileEventsQuery();
    const isAdminOrOrganizer = profile?.userPrivilege === 'ADMIN' || profile?.userPrivilege === 'ORGANIZER';
    const {data: allEventsData} = useGetEventsQuery(
        {Count: 100},
        {skip: isAdminOrOrganizer}
    );
    const navigate = useNavigate();
    const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=50';
    const [subscribeToEvent] = useSubscribeToEventMutation();
    const [unsubscribeFromEvent] = useUnsubscribeFromEventMutation();
    const [savedNextEventId, setSavedNextEventId] = useState<string | null>(null);

    const subscriptions = (subscribedEvents ?? []).map((event) => ({
        title: event.name,
        subtitle: event.location ?? '',
        avatarUrl: buildImageUrl(event.avatar) ?? fallbackAvatar,
        onClick: () => navigate(`/event?id=${event.id}`),
    }));

    const eventsForNextEvent = isAdminOrOrganizer ? subscribedEvents : (allEventsData?.result || []);

    const nextEventFromSubscriptions = useMemo(() => {
        if (!eventsForNextEvent || eventsForNextEvent.length === 0) return null;

        const now = new Date();
        const upcomingEvents = eventsForNextEvent
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
    }, [eventsForNextEvent]);

    useEffect(() => {
        if (nextEventFromSubscriptions && !savedNextEventId) {
            setSavedNextEventId(nextEventFromSubscriptions.id);
        }
    }, [nextEventFromSubscriptions, savedNextEventId]);

    const {data: savedEventData} = useGetEventByIdQuery(
        savedNextEventId ?? '',
        {skip: !savedNextEventId || !!nextEventFromSubscriptions}
    );

    const nextEvent = nextEventFromSubscriptions || savedEventData?.result || null;

    const isSubscribedToNextEvent = useMemo(() => {
        if (!nextEvent || !subscribedEvents) return false;
        return subscribedEvents.some(event => event.id === nextEvent.id);
    }, [nextEvent, subscribedEvents]);

    const isOrganizerOfNextEvent = useMemo(() => {
        if (!nextEvent || !profile) return false;
        return nextEvent.responsiblePersonId === profile.id;
    }, [nextEvent, profile]);

    const isEventUpcoming = useMemo(() => {
        if (!nextEvent) return false;
        const eventDate = new Date(nextEvent.startDate);
        return eventDate >= new Date();
    }, [nextEvent]);

    const formattedNextEventDate = useMemo(() => {
        if (!nextEvent) return '';

        const startDate = new Date(nextEvent.startDate);
        const endDate = new Date(nextEvent.endDate);

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

    // const cardRightIcon = (
    //     <NotificationBadge icon={<img src={bell} alt="Уведомления"/>} count={notificationCount}/>
    // );
    // const handleRightIconClick = () => console.log('Открыть уведомления');

    return (
        <div className={styles.sidebar}>
            <div className={styles.block}>
                <div onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                    <Card
                        title={`${profile?.lastName ?? ''} ${profile?.firstName ?? ''}`.trim()}
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

            {(profile?.userPrivilege === 'ADMIN' || profile?.userPrivilege === 'ORGANIZER') && (
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
                        isOrganizer={isOrganizerOfNextEvent}
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
