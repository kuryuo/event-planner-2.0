import styles from './EventsList.module.scss';
import {parseISO, startOfMonth, endOfMonth, isWithinInterval} from 'date-fns';
import {useNavigate} from 'react-router-dom';
import {useGetOrganizersQuery} from '@/services/api/userApi.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import EventListCard from '@/ui/event-list-card/EventListCard.tsx';

interface Event {
    id: string;
    title: string;
    description: string;
    avatar?: string | null;
    startDate: string;
    endDate: string;
    location: string;
    categories: string[];
    responsiblePersonId: string;
}

interface EventsListProps {
    events: Event[];
    currentMonth: Date;
}

export default function EventsList({events, currentMonth}: EventsListProps) {
    const navigate = useNavigate();
    const {data: organizersData} = useGetOrganizersQuery();
    const organizersById = new Map((organizersData ?? []).map((o) => [o.id, o]));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const filteredEvents = events.filter((event) => {
        const eventDate = parseISO(event.startDate);
        return isWithinInterval(eventDate, {start: monthStart, end: monthEnd});
    });

    return (
        <div className={styles.eventsList}>
            {filteredEvents.length === 0 ? (
                <div className={styles.emptyState}>
                    Нет мероприятий в этом месяце
                </div>
            ) : (
                filteredEvents.map((event) => {
                    const organizer = organizersById.get(event.responsiblePersonId);
                    const organizerName = organizer
                        ? `${organizer.lastName ?? ''} ${organizer.firstName ?? ''}`.trim() || 'Организатор'
                        : 'Организатор';

                    return (
                        <EventListCard
                            key={event.id}
                            title={event.title}
                            description={event.description}
                            location={event.location}
                            categories={event.categories}
                            startDate={event.startDate}
                            endDate={event.endDate}
                            coverUrl={buildImageUrl(event.avatar)}
                            organizers={
                                organizer
                                    ? [
                                        {
                                            id: organizer.id,
                                            name: organizerName,
                                            avatarUrl: buildImageUrl(organizer.avatarUrl),
                                        },
                                    ]
                                    : []
                            }
                            onClick={() => navigate(`/event?id=${event.id}`)}
                        />
                    );
                })
            )}
        </div>
    );
}
