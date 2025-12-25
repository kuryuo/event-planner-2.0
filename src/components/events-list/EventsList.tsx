import EventItem from '@/ui/event-item/EventItem.tsx';
import styles from './EventsList.module.scss';
import {parseISO, format, startOfMonth, endOfMonth, isWithinInterval} from 'date-fns';
import {ru} from 'date-fns/locale';
import {groupBy} from "@/utils/array.ts";
import {useGetProfileEventsQuery, useGetProfileQuery} from "@/services/api/profileApi.ts";
import {useSubscribeToEventMutation, useUnsubscribeFromEventMutation} from "@/services/api/eventApi.ts";

interface Event {
    id: string;
    date: string;
    time: string;
    title: string;
    description: string;
    avatar?: string | null;
    responsiblePersonId: string;
}

interface EventsListProps {
    events: Event[];
    currentMonth: Date;
}

export default function EventsList({events, currentMonth}: EventsListProps) {
    const {data: subscribedEvents} = useGetProfileEventsQuery();
    const {data: profile} = useGetProfileQuery();
    const [subscribeToEvent] = useSubscribeToEventMutation();
    const [unsubscribeFromEvent] = useUnsubscribeFromEventMutation();
    
    const subscribedEventIds = new Set(subscribedEvents?.map(event => event.id) || []);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const filteredEvents = events.filter(event => {
        const eventDate = parseISO(event.date);
        return isWithinInterval(eventDate, {start: monthStart, end: monthEnd});
    });

    const grouped = groupBy(filteredEvents, (event) => event.date);

    const handleSubscribe = async (eventId: string) => {
        await subscribeToEvent(eventId);
    };

    const handleUnsubscribe = async (eventId: string) => {
        await unsubscribeFromEvent(eventId);
    };

    return (
        <div className={styles.eventsList}>
            {Object.keys(grouped).length === 0 ? (
                <div className={styles.emptyState}>
                    Нет мероприятий в этом месяце
                </div>
            ) : (
                Object.entries(grouped).map(([date, eventsForDay]) => {
                    const day = parseISO(date);
                    const dayOfWeek = format(day, 'EEEE', {locale: ru});
                    const formattedDate = format(day, "d MMMM", {locale: ru});
                    const dateWithDay = `${formattedDate}, ${dayOfWeek}`;

                    return (
                        <div key={date} className={styles.dayGroup}>
                            <div className={styles.dateHeader}>
                                {eventsForDay.length > 1 && ` (${eventsForDay.length} мероприятия)`}
                                {dateWithDay}
                            </div>
                            {eventsForDay.map(event => {
                                const isOrganizer = profile && event.responsiblePersonId === profile.id;
                                return (
                                    <EventItem
                                        key={event.id}
                                        eventId={event.id}
                                        time={event.time}
                                        title={event.title}
                                        description={event.description}
                                        avatar={event.avatar}
                                        isSubscribed={subscribedEventIds.has(event.id)}
                                        isOrganizer={isOrganizer}
                                        onSubscribe={handleSubscribe}
                                        onUnsubscribe={handleUnsubscribe}
                                    />
                                );
                            })}
                        </div>
                    );
                })
            )}
        </div>
    );
}