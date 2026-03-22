import {useMemo, useState} from 'react';
import styles from './Participants.module.scss';
import TextField from '@/ui/text-field/TextField.tsx';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import Button from '@/ui/button/Button.tsx';
import ParticipantCard from './ParticipantCard.tsx';
import {useGetEventSubscribersQuery} from '@/services/api/eventApi.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';

interface ParticipantsProps {
    eventId: string | null;
    maxParticipants?: number;
    isAdmin?: boolean;
}

export default function Participants({eventId, maxParticipants, isAdmin = false}: ParticipantsProps) {
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
        ? `${participantsCount} из ${maxParticipants}`
        : String(participantsCount);

    return (
        <section className={styles.participants}>
            <div className={styles.header}>
                <h2 className={styles.title}>Участники</h2>
                <span className={styles.count}>{formattedCount}</span>
            </div>

            <div className={styles.controls}>
                <TextField
                    placeholder="Имя"
                    value={searchName}
                    leftIcon={<SearchIcon/>}
                    onChange={(event) => setSearchName(event.target.value)}
                />

                {isAdmin && (
                    <Button variant="Filled" color="gray" disabled>
                        Добавить
                    </Button>
                )}
            </div>

            {isLoading && <div className={styles.state}>Загрузка...</div>}

            {!isLoading && error && (
                <div className={styles.state}>Ошибка загрузки участников</div>
            )}

            {!isLoading && !error && participants.length === 0 && (
                <div className={styles.state}>Участников пока нет</div>
            )}

            {!isLoading && !error && participants.length > 0 && (
                <div className={styles.list}>
                    {participants.map((participant) => (
                        <ParticipantCard
                            key={participant.id}
                            name={participant.name || 'Пользователь'}
                            avatarUrl={buildImageUrl(participant.avatarUrl) ?? null}
                            role={participant.role}
                            eventId={eventId || ''}
                            userId={participant.id}
                            showActions={isAdmin}
                            canEditRoles={isAdmin}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
