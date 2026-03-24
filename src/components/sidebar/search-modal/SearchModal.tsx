import {useEffect, useMemo, useState, type RefObject} from 'react';
import {createPortal} from 'react-dom';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import Divider from '@/ui/divider/Divider';
import EventPlate from '@/ui/event-plate/EventPlate';
import {Card} from '@/ui/card/Card';
import {useGetOrganizersQuery} from '@/services/api/userApi';
import {buildImageUrl} from '@/utils/buildImageUrl';
import type {UserEvent} from '@/types/api/Profile';
import styles from './SearchModal.module.scss';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    query: string;
    events: UserEvent[];
    onEventClick: (eventId: string) => void;
    recentSearches: string[];
    onRecentSelect: (query: string) => void;
    onRecentRemove: (query: string) => void;
    onTrackSearch: (query: string) => void;
    anchorRef: RefObject<HTMLElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
}

// TODO: временное клиентское ранжирование. После появления backend endpoint поиска перенести фильтрацию и fuzzy-логику на сервер.

const normalizeText = (value: string): string => value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

const toWords = (value: string): string[] => normalizeText(value).split(' ').filter(Boolean);

const levenshteinDistance = (first: string, second: string): number => {
    if (first === second) return 0;
    if (!first.length) return second.length;
    if (!second.length) return first.length;

    const previous = new Array(second.length + 1).fill(0).map((_, index) => index);
    const current = new Array(second.length + 1).fill(0);

    for (let i = 1; i <= first.length; i += 1) {
        current[0] = i;

        for (let j = 1; j <= second.length; j += 1) {
            const cost = first[i - 1] === second[j - 1] ? 0 : 1;
            current[j] = Math.min(
                current[j - 1] + 1,
                previous[j] + 1,
                previous[j - 1] + cost,
            );
        }

        for (let j = 0; j <= second.length; j += 1) {
            previous[j] = current[j];
        }
    }

    return previous[second.length];
};

const hasFuzzyMatch = (text: string, query: string): boolean => {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return true;
    if (!normalizedText) return false;
    if (normalizedText.includes(normalizedQuery)) return true;

    const queryWords = toWords(normalizedQuery);
    const textWords = toWords(normalizedText);
    if (!queryWords.length || !textWords.length) return false;

    return queryWords.every((queryWord) => {
        if (queryWord.length <= 2) {
            return textWords.some((word) => word.startsWith(queryWord));
        }

        const maxDistance = queryWord.length <= 4 ? 1 : 2;

        return textWords.some((word) => {
            if (word.includes(queryWord) || queryWord.includes(word)) {
                return true;
            }

            return levenshteinDistance(word, queryWord) <= maxDistance;
        });
    });
};

export default function SearchModal({
    isOpen,
    onClose,
    query,
    events,
    onEventClick,
    recentSearches,
    onRecentSelect,
    onRecentRemove,
    onTrackSearch,
    anchorRef,
    panelRef,
}: SearchModalProps) {
    const {data: organizers = []} = useGetOrganizersQuery();
    const searchQuery = query.trim();
    const hasQuery = Boolean(searchQuery);

    const {upcomingEvents, archivedEvents} = useMemo(() => {
        const now = new Date();

        const mapped = events.map((event) => ({
            id: event.id,
            title: event.name,
            date: format(new Date(event.startDate), 'd MMMM', {locale: ru}),
            avatarUrl: buildImageUrl(event.avatar),
            startDate: new Date(event.startDate),
        }));

        const filtered = hasQuery
            ? mapped.filter((event) => hasFuzzyMatch(event.title, searchQuery))
            : mapped;

        const upcoming = filtered
            .filter((event) => event.startDate >= now)
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        const archived = filtered
            .filter((event) => event.startDate < now)
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        return {upcomingEvents: upcoming, archivedEvents: archived};
    }, [events, hasQuery, searchQuery]);

    const people = useMemo(() => {
        const mapped = organizers.map((organizer) => ({
            id: organizer.id,
            title: `${organizer.lastName || ''} ${organizer.firstName || ''} ${organizer.middleName || ''}`.trim() || 'Без имени',
            subtitle: organizer.city || undefined,
            avatarUrl: buildImageUrl(organizer.avatarUrl),
        }));

        if (!hasQuery) {
            return mapped;
        }

        return mapped.filter((person) => {
            const searchable = `${person.title} ${person.subtitle || ''}`.trim();
            return hasFuzzyMatch(searchable, searchQuery);
        });
    }, [organizers, hasQuery, searchQuery]);

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
                                <div key={query} className={styles.recentChip}>
                                    <button
                                        type="button"
                                        className={styles.recentChipSelect}
                                        onClick={() => onRecentSelect(query)}
                                    >
                                        {query}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.recentChipRemove}
                                        aria-label={`Удалить запрос ${query}`}
                                        onClick={() => onRecentRemove(query)}
                                    >
                                        ×
                                    </button>
                                </div>
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
                                            onTrackSearch(hasQuery ? searchQuery : event.title);
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
                                            onTrackSearch(hasQuery ? searchQuery : event.title);
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

                {hasQuery && upcomingEvents.length === 0 && archivedEvents.length === 0 && people.length === 0 && (
                    <div className={styles.section}>
                        <span className={styles.emptyText}>Ничего не найдено. Проверьте запрос или попробуйте другое слово.</span>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
