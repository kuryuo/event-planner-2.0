import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import Chip from '@/ui/chip/Chip.tsx';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import GeoAltIcon from '@/assets/img/icon-m/geo-alt.svg?react';
import styles from './ArchiveEventCard.module.scss';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import type {UserEvent} from '@/types/api/Profile.ts';

interface ArchiveEventCardProps {
    event: UserEvent;
    onClick: (eventId: string) => void;
}

const FALLBACK_PREVIEW = 'https://api.dicebear.com/7.x/shapes/png?size=1200&radius=16';

const getFakeParticipants = (seed: string) => {
    return Array.from({length: 4}, (_, index) => (
        `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${seed}-${index}`
    ));
};

export default function ArchiveEventCard({event, onClick}: ArchiveEventCardProps) {
    const date = format(new Date(event.startDate), 'd MMMM, HH:mm', {locale: ru});
    const category = event.categories?.[0] ?? 'Категория';
    const preview = buildImageUrl(event.avatar) ?? buildImageUrl(event.previewPhotos?.[0]) ?? FALLBACK_PREVIEW;

    return (
        <article className={styles.card} onClick={() => onClick(event.id)}>
            <img className={styles.preview} src={preview} alt={event.name}/>

            <div className={styles.chipsRow}>
                <Chip text={category} size="M" variant="filled" color="orange"/>
                <Chip text="Вы редактор" size="M" variant="filled" color="cyan"/>
            </div>

            <h3 className={styles.title}>{event.name}</h3>

            <div className={styles.metaRow}>
                <span className={styles.metaItem}><CalendarIcon/>{date}</span>
                <span className={styles.metaItem}><GeoAltIcon/>{event.location || 'Zoom'}</span>
            </div>

            <p className={styles.description}>{event.description || 'Описание мероприятия не добавлено'}</p>

            <div className={styles.footer}>
                <div className={styles.participants}>
                    {getFakeParticipants(event.id).map((avatar, index) => (
                        <img key={avatar} src={avatar} alt="participant" className={styles.participantAvatar} style={{zIndex: 5 - index}}/>
                    ))}
                </div>

                <div className={styles.progressInfo}>
                    <div className={styles.progressHeader}>
                        <span>Выполнено задач</span>
                        <span>5/43</span>
                    </div>
                    <div className={styles.progressTrack}>
                        <div className={styles.progressBar}/>
                    </div>
                </div>
            </div>
        </article>
    );
}
