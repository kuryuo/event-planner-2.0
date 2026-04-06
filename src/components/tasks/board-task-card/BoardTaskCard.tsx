import Avatar from '@/ui/avatar/Avatar';
import Chip from '@/ui/chip/Chip';
import ChatIcon from '@/assets/img/icon-m/chat.svg?react';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import styles from './BoardTaskCard.module.scss';

type Priority = 'Срочный' | 'Высокий' | 'Средний' | 'Низкий';

interface Props {
    title: string;
    description?: string;
    dueDate?: string;
    assigneeName: string;
    assigneeAvatar?: string;
    priority: Priority;
    commentsCount: number;
}

const formatDeadline = (value?: string) => {
    if (!value) return 'Без срока';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Без срока';
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `До ${date.getDate()} ${months[date.getMonth()]}`;
};

const priorityColorByValue = {
    'Срочный': 'orange',
    'Высокий': 'pink',
    'Средний': 'blue',
    'Низкий': 'green',
} as const;

export default function BoardTaskCard({title, description, dueDate, assigneeName, assigneeAvatar, priority, commentsCount}: Props) {
    return (
        <article className={styles.card}>
            <Chip text={priority} size="S" variant="filled" color={priorityColorByValue[priority]}/>

            <div className={styles.textBlock}>
                <h4>{title}</h4>
                <p>{description || 'Описание отсутствует'}</p>
            </div>

            <div className={styles.metaRow}>
                <div className={styles.assignee}>
                    <Avatar size="S" avatarUrl={assigneeAvatar} name={assigneeName}/>
                    <span>{assigneeName}</span>
                </div>

                <div className={styles.extra}>
                    <span><ChatIcon/>{commentsCount}</span>
                    <span><CalendarIcon/>{formatDeadline(dueDate)}</span>
                </div>
            </div>
        </article>
    );
}
