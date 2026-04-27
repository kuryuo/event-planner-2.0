import Avatar from '@/ui/avatar/Avatar.tsx';
import Chip from '@/ui/chip/Chip.tsx';
import FileLinesIcon from '@/assets/image/file-lines.svg?react';
import OwnerIcon from '@/assets/image/owner-icon.svg?react';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useEventSubscribers} from '@/hooks/api/useEventSubscribers.ts';
import styles from './ArchivedEventOverview.module.scss';

interface ArchivedEventOverviewProps {
    eventId: string;
    title: string;
    avatar?: string | null;
    formattedDate: string;
    location: string;
    description: string;
    categories: Array<{text: string}>;
}

export default function ArchivedEventOverview({
    eventId,
    title,
    avatar,
    formattedDate,
    location,
    description,
    categories,
}: ArchivedEventOverviewProps) {
    const {participants} = useEventSubscribers(eventId);

    const mapRoleLabel = (role?: string | null): string => {
        const normalized = (role ?? '').toLowerCase();
        if (normalized.includes('organizer')) return 'Организатор';
        if (normalized.includes('editor')) return 'Редактор';
        if (normalized.includes('assistant')) return 'Помощник';
        if (normalized.includes('observer')) return 'Наблюдатель';
        return 'Участник';
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.topRow}>
                <Avatar size="L" shape="square" fallbackType="event" name={title} avatarUrl={buildImageUrl(avatar)}/>
                <h2 className={styles.title}>{title}</h2>
            </div>

            <div className={styles.mainInfoRow}>
                <section className={styles.infoBlock}>
                    <h3 className={styles.blockTitle}>Основная информация</h3>
                    <div className={styles.infoGrid}>
                        <span className={styles.label}>Тип</span>
                        <span className={styles.value}><Chip text={categories[0]?.text || 'Событие'} size="M" variant="filled" color="orange"/></span>

                        <span className={styles.label}>Дата и время</span>
                        <span className={styles.value}>{formattedDate || 'Не указано'}</span>

                        <span className={styles.label}>Место</span>
                        <span className={styles.value}>{location || 'Не указано'}</span>

                        <span className={styles.label}>Теги</span>
                        <span className={styles.value}>
                            <span className={styles.tagsRow}>
                                {categories.map((category) => (
                                    <Chip key={category.text} text={category.text} size="M" variant="filled" color="purple"/>
                                ))}
                            </span>
                        </span>

                        <span className={styles.label}>Посетители</span>
                        <span className={styles.value}>{participants.length}</span>
                    </div>
                </section>

                <section className={styles.reportCard}>
                    <h3 className={styles.reportTitle}>Отчет по мероприятию</h3>
                    <div className={styles.reportLink}>
                        <FileLinesIcon/>
                        <span>Отчет_34234324.pdf</span>
                    </div>
                </section>
            </div>

            <section className={styles.descriptionBlock}>
                <h3 className={styles.blockTitle}>Описание</h3>
                <p className={styles.descriptionText}>{description || 'Описание отсутствует'}</p>
            </section>

            <section className={styles.participantsBlock}>
                <h3 className={styles.blockTitle}>Участники</h3>
                <div className={styles.participantsList}>
                    {participants.map((participant) => (
                        <div key={participant.id} className={styles.participantRow}>
                            <div className={styles.participantInfo}>
                                <Avatar size="M" name={participant.name} avatarUrl={participant.avatarUrl}/>
                                <span>{participant.name}</span>
                            </div>
                            {mapRoleLabel(participant.role) === 'Организатор' ? (
                                <div className={styles.ownerBadge}>
                                    <OwnerIcon className={styles.ownerIcon}/>
                                </div>
                            ) : (
                                <Chip text={mapRoleLabel(participant.role)} size="M" variant="filled" color="purple"/>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
