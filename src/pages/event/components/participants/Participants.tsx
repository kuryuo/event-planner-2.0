import {useMemo, useState} from 'react';
import styles from './Participants.module.scss';
import {Input} from "antd";
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import {Button} from "antd";
import ParticipantCard from './ParticipantCard.tsx';
import {useGetEventSubscribersQuery} from '@/services/api/eventApi.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useI18n} from '@/i18n/I18nProvider';

interface ParticipantsProps {
    eventId: string | null;
    maxParticipants?: number;
    /** Роли участников, исключение, кнопка «Добавить» — только у организатора */
    canManageParticipants?: boolean;
}

export default function Participants({eventId, maxParticipants, canManageParticipants = false}: ParticipantsProps) {
    const {t} = useI18n();
    const [searchName, setSearchName] = useState('');

    const {data, isLoading, error} = useGetEventSubscribersQuery(
        {
            eventId: eventId ?? '',
            count: 100,
            name: searchName.trim() || undefined,
        },
        {skip: !eventId}
    );

    const participants = useMemo(() => data?.res?.users ?? [], [data]);
    const participantsCount = data?.res?.totalCount ?? participants.length;

    const formattedCount = maxParticipants
        ? `${participantsCount} / ${maxParticipants}`
        : String(participantsCount);

    return (
        <section className={styles.participants}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('eventPage.participants')}</h2>
                <span className={styles.count}>{formattedCount}</span>
            </div>

            <div className={styles.controls}>
                <Input
                    placeholder={t('eventPage.name')}
                    value={searchName}
                    prefix={<SearchIcon/>}
                    className="ep-input ep-input--m"
                    onChange={(event) => setSearchName(event.target.value)}
                />

                {canManageParticipants && (
                    <Button type="default" className="ep-btn ep-btn--m ep-btn--filled-gray" disabled>
                        {t('eventPage.add')}
                    </Button>
                )}
            </div>

            {isLoading && <div className={styles.state}>{t('eventPage.loading')}</div>}

            {!isLoading && error && (
                <div className={styles.state}>{t('eventPage.participantsLoadFailed')}</div>
            )}

            {!isLoading && !error && participants.length === 0 && (
                <div className={styles.state}>{t('eventPage.noParticipants')}</div>
            )}

            {!isLoading && !error && participants.length > 0 && (
                <div className={styles.list}>
                    {participants.map((participant) => (
                        <ParticipantCard
                            key={participant.id}
                            name={participant.name || t('eventPage.user')}
                            avatarUrl={buildImageUrl(participant.avatarUrl) ?? null}
                            role={participant.role}
                            eventId={eventId || ''}
                            userId={participant.id}
                            showActions={canManageParticipants}
                            canEditRoles={canManageParticipants}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
