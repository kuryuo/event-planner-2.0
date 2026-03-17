import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Sidebar from '@/components/sidebar/Sidebar';
import TextField from '@/ui/text-field/TextField.tsx';
import ArchiveEventCard from '@/components/archive-event-card/ArchiveEventCard.tsx';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import FilterIcon from '@/assets/img/icon-m/filter.svg?react';
import {useGetProfileEventsQuery} from '@/services/api/profileApi.ts';
import type {UserEvent} from '@/types/api/Profile.ts';
import styles from './ArchivePage.module.scss';

const isArchivedEvent = (event: UserEvent): boolean => {
    const status = (event.status ?? '').toLowerCase();
    const archivedByStatus =
        status.includes('finish')
        || status.includes('complete')
        || status.includes('done')
        || status.includes('closed')
        || status.includes('cancel')
        || status.includes('archive');

    const endDate = event.endDate || event.startDate;
    const archivedByDate = Number.isFinite(new Date(endDate).getTime()) && new Date(endDate).getTime() < Date.now();

    return archivedByStatus || archivedByDate;
};

export default function ArchivePage() {
    const navigate = useNavigate();
    const {data: events = [], isLoading} = useGetProfileEventsQuery();
    const [query, setQuery] = useState('');

    const archivedEvents = useMemo(() => {
        return events
            .filter(isArchivedEvent)
            .filter((event) => event.name.toLowerCase().includes(query.toLowerCase().trim()))
            .sort((a, b) => {
                const firstDate = new Date(a.endDate || a.startDate).getTime();
                const secondDate = new Date(b.endDate || b.startDate).getTime();
                return secondDate - firstDate;
            });
    }, [events, query]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={5}/>
            </div>

            <div className={styles.content}>
                <div className={styles.headerCard}>
                    <div>
                        <h1 className={styles.title}>Архив</h1>
                        <p className={styles.subtitle}>Здесь хранятся все прошедшие и отмененные мероприятия</p>
                    </div>

                    <div className={styles.searchRow}>
                        <TextField
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Название мероприятия..."
                            leftIcon={<SearchIcon/>}
                        />
                        <button className={styles.filterButton} aria-label="Фильтры">
                            <FilterIcon/>
                        </button>
                    </div>
                </div>

                <section className={styles.listCard}>
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <p>Загружаем архив...</p>
                        </div>
                    ) : archivedEvents.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.cubesPlaceholder}>
                                {Array.from({length: 18}, (_, index) => (
                                    <span key={index}/>
                                ))}
                            </div>
                            <p>Ничего не найдено</p>
                            <p className={styles.emptyHint}>Попробуйте изменить запрос</p>
                        </div>
                    ) : (
                        <>
                            {/* TODO: when backend adds dedicated archive endpoint, replace client-side archive filtering */}
                            <div className={styles.grid}>
                                {archivedEvents.map((event) => (
                                    <ArchiveEventCard
                                        key={event.id}
                                        event={event}
                                        onClick={(eventId) => navigate(`/event?id=${eventId}`)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
