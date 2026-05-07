import {Avatar} from "antd";
import OwnerIcon from '@/assets/image/owner-icon.svg?react';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useEventSubscribers} from '@/hooks/api/useEventSubscribers.ts';
import styles from './ArchivedEventOverview.module.scss';
import type {VenueFormat} from '@/types/api/Event.ts';
import {formatEventPlaceText} from '@/utils/eventPlace.ts';
import {getParticipantRoleName, isEventOrganizer} from '@/utils/participantRole.ts';
import {Tag} from "antd";

interface ArchivedEventOverviewProps {
    eventId: string;
    title: string;
    avatar?: string | null;
    formattedDate: string;
    location: string;
    auditorium?: string | null;
    venueFormat?: VenueFormat | null;
    description: string;
    categories: Array<{text: string}>;
    responsiblePersonId?: string;
}

export default function ArchivedEventOverview({
    eventId,
    title,
    avatar,
    formattedDate,
    location,
    auditorium,
    venueFormat,
    description,
    categories,
    responsiblePersonId,
}: ArchivedEventOverviewProps) {
    const {participants} = useEventSubscribers(eventId);

    const placeText = formatEventPlaceText({location, auditorium, venueFormat});
    const tagTextStyleM = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14,
        fontWeight: 450,
        lineHeight: "18px",
        padding: "2px 16px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;

    return (
        <div className={styles.wrapper}>
            <div className={styles.topRow}>
                <Avatar className="ep-avatar" size={64} shape="square" src={buildImageUrl(avatar)}>
                    {(title?.[0] ?? "—").toUpperCase()}
                </Avatar>
                <h2 className={styles.title}>{title}</h2>
            </div>

            <section className={styles.infoBlock}>
                <h3 className={styles.blockTitle}>Основная информация</h3>
                <div className={styles.infoGrid}>
                    <span className={styles.label}>Тип</span>
                    <span className={styles.value}>
                        <Tag
                            bordered={false}
                            style={{
                                ...tagTextStyleM,
                                backgroundColor: "var(--bg-orange)",
                                color: "var(--content-orange)",
                            }}
                        >
                            {categories[0]?.text || 'Событие'}
                        </Tag>
                    </span>

                    <span className={styles.label}>Дата и время</span>
                    <span className={styles.value}>{formattedDate || 'Не указано'}</span>

                    <span className={styles.label}>Место</span>
                    <span className={styles.value}>{placeText}</span>

                    <span className={styles.label}>Теги</span>
                    <span className={styles.value}>
                        <span className={styles.tagsRow}>
                            {categories.map((category) => (
                                <Tag
                                    key={category.text}
                                    bordered={false}
                                    style={{
                                        ...tagTextStyleM,
                                        backgroundColor: "var(--bg-purple)",
                                        color: "var(--content-purple)",
                                    }}
                                >
                                    {category.text}
                                </Tag>
                            ))}
                        </span>
                    </span>

                    <span className={styles.label}>Посетители</span>
                    <span className={styles.value}>{participants.length}</span>
                </div>
            </section>

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
                                <Avatar className="ep-avatar" size={48} src={participant.avatarUrl || undefined}>
                                    {(participant.name?.[0] ?? "—").toUpperCase()}
                                </Avatar>
                                <span>{participant.name}</span>
                            </div>
                            {isEventOrganizer({
                                role: participant.role,
                                userId: participant.id,
                                responsiblePersonId,
                            }) ? (
                                <div className={styles.ownerBadge}>
                                    <OwnerIcon className={styles.ownerIcon}/>
                                </div>
                            ) : (
                                <Tag
                                    bordered={false}
                                    style={{
                                        ...tagTextStyleM,
                                        backgroundColor: "var(--bg-purple)",
                                        color: "var(--content-purple)",
                                    }}
                                >
                                    {getParticipantRoleName(participant.role)}
                                </Tag>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
