import {useMemo} from 'react';
import clsx from 'clsx';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import Chip from '@/ui/chip/Chip';
import styles from './EventListCard.module.scss';
import ClockIcon from '@/assets/image/clock.svg?react';

interface Organizer {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface EventListCardProps {
    title: string;
    description: string;
    location: string;
    categories: string[];
    startDate: string;
    endDate: string;
    coverUrl?: string;
    organizers?: Organizer[];
    className?: string;
    onClick?: () => void;
}

export default function EventListCard({
                                         title,
                                         description,
                                         location,
                                         categories,
                                         startDate,
                                         endDate,
                                         coverUrl,
                                         organizers = [],
                                         className,
                                         onClick,
                                     }: EventListCardProps) {
    const dateTime = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const datePart = format(start, 'd MMMM', {locale: ru});
        const startTime = format(start, 'HH:mm', {locale: ru});
        const endTime = format(end, 'HH:mm', {locale: ru});
        return `${datePart}, ${startTime}-${endTime}`;
    }, [startDate, endDate]);

    const visibleCategories = categories.slice(0, 3);

    const visibleOrganizers = organizers.slice(0, 5);
    const remainingOrganizers = organizers.length - visibleOrganizers.length;

    return (
        <button
            type="button"
            className={clsx(styles.card, className)}
            onClick={onClick}
        >
            <div className={styles.cover}>
                {coverUrl ? (
                    <img className={styles.coverImg} src={coverUrl} alt={title} />
                ) : (
                    <div className={styles.coverPlaceholder} />
                )}
            </div>

            <div className={styles.body}>
                {visibleCategories.length > 0 && (
                    <div className={styles.chips}>
                        {visibleCategories.map((c) => (
                            <Chip key={c} text={c} size="S" />
                        ))}
                    </div>
                )}

                <div className={styles.title}>{title}</div>

                <div className={styles.metaRow}>
                    <span className={styles.clock}>
                        <ClockIcon />
                    </span>
                    <span className={styles.dateTime}>{dateTime}</span>
                    <span className={styles.location}>{location}</span>
                </div>

                <div className={styles.description}>{description}</div>

                <div className={styles.footer}>
                    {visibleOrganizers.length > 0 && (
                        <div className={styles.organizers}>
                            {visibleOrganizers.map((org, index) => (
                                <span
                                    key={org.id}
                                    className={styles.organizer}
                                    style={{zIndex: index + 1}}
                                    title={org.name}
                                >
                                    {org.avatarUrl ? (
                                        <img className={styles.organizerImg} src={org.avatarUrl} alt={org.name} />
                                    ) : (
                                        <span className={styles.organizerFallback} />
                                    )}
                                </span>
                            ))}
                            {remainingOrganizers > 0 && (
                                <span className={styles.organizerMore}>+{remainingOrganizers}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
