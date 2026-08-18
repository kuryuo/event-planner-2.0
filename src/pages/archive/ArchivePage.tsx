import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { AppShell } from '@/components/app-shell/AppShell';
import {Input} from "antd";
import ArchiveEventCard from '@/pages/archive/components/archive-event-card/ArchiveEventCard.tsx';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import FilterIcon from '@/assets/img/icon-m/filter.svg?react';
import {useGetProfileEventsQuery} from '@/services/api/profileApi.ts';
import type {UserEvent} from '@/types/api/Profile.ts';
import pixelsArt from '@/assets/image/pixels.svg?url';
import styles from './ArchivePage.module.scss';
import {useGetArchivedEventsQuery} from '@/services/api/eventApi.ts';
import {useI18n} from '@/i18n/I18nProvider';

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
    const {t} = useI18n();
    const navigate = useNavigate();
    const {data: archivedResponse, isLoading, isError} = useGetArchivedEventsQuery({Count: 20, Offset: 0});
    const {data: profileEvents = []} = useGetProfileEventsQuery(undefined, {skip: !isError});
    const [query, setQuery] = useState('');

    const archivedEvents = useMemo(() => {
        const events = isError
            ? profileEvents
            : ((archivedResponse?.result ?? []) as UserEvent[]);

        return events
            .filter((event) => (isError ? isArchivedEvent(event) : true))
            .filter((event) => event.name.toLowerCase().includes(query.toLowerCase().trim()))
            .sort((a, b) => {
                const firstDate = new Date(a.endDate || a.startDate).getTime();
                const secondDate = new Date(b.endDate || b.startDate).getTime();
                return secondDate - firstDate;
            });
    }, [archivedResponse?.result, isError, profileEvents, query]);

    return (
        <AppShell
            pageWrapperClassName={styles.pageWrapper}
            sidebarColumnClassName={styles.sidebar}
            sidebarProps={{ notificationCount: 5 }}
        >
            <div className={styles.content}>
                <div className={styles.headerCard}>
                    <div>
                        <h1 className={styles.title}>{t('archive.title')}</h1>
                        <p className={styles.subtitle}>{t('archive.subtitle')}</p>
                    </div>

                    <div className={styles.searchRow}>
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={t('archive.eventNamePlaceholder')}
                            prefix={<SearchIcon/>}
                            className="ep-input ep-input--m"
                        />
                        <button className={styles.filterButton} aria-label={t('archive.filters')}>
                            <FilterIcon/>
                        </button>
                    </div>
                </div>

                <section className={styles.listCard}>
                    {isLoading ? (
                        <div className={styles.emptyState}>
                            <p>{t('archive.loading')}</p>
                        </div>
                    ) : archivedEvents.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div
                                className={styles.emptyPixelsBackdrop}
                                style={{backgroundImage: `url(${pixelsArt})`}}
                                aria-hidden
                            />
                            <div className={styles.emptyStateContent}>
                                <p>{t('archive.empty')}</p>
                                <p className={styles.emptyHint}>{t('archive.emptyHint')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {archivedEvents.map((event) => (
                                <ArchiveEventCard
                                    key={event.id}
                                    event={event}
                                    onClick={(eventId) => navigate(`/event?id=${eventId}`)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppShell>
    );
}
