import EventItem from '@/ui/event-item/EventItem.tsx';
import styles from './EventsList.module.scss';
import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale';

interface Event {
    id: string;
    date: string;
    time: string;
    title: string;
    description: string;
}

interface EventsListProps {
    events: Event[];
}

export default function EventsList({events}: EventsListProps) {
    const grouped: Record<string, Event[]> = {};
    events.forEach(event => {
        if (!grouped[event.date]) grouped[event.date] = [];
        grouped[event.date].push(event);
    });

    return (
        <div className={styles.eventsList}>
            {Object.entries(grouped).map(([date, eventsForDay]) => {
                const day = parseISO(date);
                const formattedDate = format(day, 'd MMMM, EEEE', {locale: ru});

                return (
                    <div key={date} className={styles.dayGroup}>
                        <div className={styles.dateHeader}>
                            {formattedDate}
                            {eventsForDay.length > 1 && ` (${eventsForDay.length} мероприятия)`}
                        </div>
                        {eventsForDay.map(event => (
                            <EventItem
                                key={event.id}
                                time={event.time}
                                title={event.title}
                                description={event.description}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
