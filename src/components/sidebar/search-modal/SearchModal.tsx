import {useEffect, useMemo, useState, type RefObject} from 'react';
import {createPortal} from 'react-dom';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import Divider from '@/ui/divider/Divider';
import Chip from '@/ui/chip/Chip';
import EventPlate from '@/ui/event-plate/EventPlate';
import {Card} from '@/ui/card/Card';
import {useGetOrganizersQuery} from '@/services/api/userApi';
import {buildImageUrl} from '@/utils/buildImageUrl';
import type {UserEvent} from '@/types/api/Profile';
import styles from './SearchModal.module.scss';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: UserEvent[];
    onEventClick: (eventId: string) => void;
    anchorRef: RefObject<HTMLElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
}

const fallbackAvatar = 'https://api.dicebear.com/7.x/shapes/png?size=200&radius=12';

export default function SearchModal({
    isOpen,
    onClose,
    events,
    onEventClick,
    anchorRef,
    panelRef,
}: SearchModalProps) {
    const [recentSearches, setRecentSearches] = useState<string[]>([
        'хакатон',
        'лекция',
        'урФУ',
        'спецкурс',
    ]);
    const {data: organizers = []} = useGetOrganizersQuery();

    const {upcomingEvents, archivedEvents} = useMemo(() => {
        const now = new Date();

        const mapped = events.map((event) => ({
            id: event.id,
            title: event.name,
            date: format(new Date(event.startDate), 'd MMMM', {locale: ru}),
            avatarUrl: buildImageUrl(event.avatar) ?? fallbackAvatar,
            startDate: new Date(event.startDate),
        }));

        const upcoming = mapped
            .filter((event) => event.startDate >= now)
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        const archived = mapped
            .filter((event) => event.startDate < now)
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        return {upcomingEvents: upcoming, archivedEvents: archived};
    }, [events]);

    const people = useMemo(() => {
        return organizers.map((organizer) => ({
            id: organizer.id,
            title: `${organizer.lastName || ''} ${organizer.firstName || ''} ${organizer.middleName || ''}`.trim() || 'Без имени',
            subtitle: organizer.city || undefined,
            avatarUrl: buildImageUrl(organizer.avatarUrl) ?? fallbackAvatar,
        }));
    }, [organizers]);

    const [position, setPosition] = useState({top: 0, left: 0});

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const updatePosition = () => {
            if (!anchorRef.current) {
                return;
            }

            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                left: rect.left,
            });
        };

        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, anchorRef]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div
            ref={panelRef}
            className={styles.dropdown}
            style={{top: position.top, left: position.left}}
        >
            <div className={styles.content}>
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Недавние</span>
                    {recentSearches.length > 0 ? (
                        <div className={styles.chips}>
                            {recentSearches.map((query) => (
                                <Chip
                                    key={query}
                                    text={query}
                                    size="S"
                                    closable
                                    className={styles.recentChip}
                                    onClose={() => setRecentSearches((prev) => prev.filter((item) => item !== query))}
                                />
                            ))}
                        </div>
                    ) : (
                        <span className={styles.emptyText}>Нет недавних поисков</span>
                    )}
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Мероприятия</span>
                    {upcomingEvents.length > 0 ? (
                        <div className={styles.list}>
                            {upcomingEvents.map((event, index) => (
                                <div key={event.id} className={styles.listItem}>
                                    <EventPlate
                                        title={event.title}
                                        date={event.date}
                                        avatarUrl={event.avatarUrl}
                                        onClick={() => {
                                            onEventClick(event.id);
                                            onClose();
                                        }}
                                    />
                                    {index < upcomingEvents.length - 1 && <Divider />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.emptyText}>Нет мероприятий</span>
                    )}
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Люди</span>
                    {people.length > 0 ? (
                        <div className={styles.list}>
                            {people.map((person, index) => (
                                <div key={person.id} className={styles.listItem}>
                                    <Card
                                        title={person.title}
                                        subtitle={person.subtitle}
                                        avatarUrl={person.avatarUrl}
                                        size="S"
                                    />
                                    {index < people.length - 1 && <Divider />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.emptyText}>Нет пользователей</span>
                    )}
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Архив</span>
                    {archivedEvents.length > 0 ? (
                        <div className={styles.list}>
                            {archivedEvents.map((event, index) => (
                                <div key={event.id} className={styles.listItem}>
                                    <EventPlate
                                        title={event.title}
                                        date={event.date}
                                        avatarUrl={event.avatarUrl}
                                        onClick={() => {
                                            onEventClick(event.id);
                                            onClose();
                                        }}
                                    />
                                    {index < archivedEvents.length - 1 && <Divider />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.emptyText}>Архив пуст</span>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
