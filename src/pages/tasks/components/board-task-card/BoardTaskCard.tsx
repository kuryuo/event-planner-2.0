import {Avatar} from "antd";
import ChatIcon from '@/assets/img/icon-m/chat.svg?react';
import CalendarIcon from '@/assets/img/icon-m/calendar.svg?react';
import styles from './BoardTaskCard.module.scss';
import {Tag} from "antd";

export type BoardTaskCardPriority = 'Срочный' | 'Высокий' | 'Средний' | 'Низкий';

interface Props {
    title: string;
    description?: string;
    dueDate?: string;
    assigneeName: string;
    assigneeAvatar?: string;
    priority: BoardTaskCardPriority;
    commentsCount: number;
    avatarFallbackType?: 'user' | 'event';
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
    const tagTextStyleS = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 16,
        fontWeight: 450,
        lineHeight: "22px",
        padding: "2px 12px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;
    const priorityColor = priorityColorByValue[priority];

    return (
        <article className={styles.card}>
            <Tag
                bordered={false}
                style={{
                    ...tagTextStyleS,
                    backgroundColor: `var(--bg-${priorityColor})`,
                    color: `var(--content-${priorityColor})`,
                }}
            >
                {priority}
            </Tag>

            <div className={styles.textBlock}>
                <h4>{title}</h4>
                <p>{description || 'Описание отсутствует'}</p>
            </div>

            <div className={styles.metaRow}>
                <div className={styles.assignee}>
                    <Avatar className="ep-avatar" size={36} src={assigneeAvatar}>
                        {(assigneeName?.[0] ?? "—").toUpperCase()}
                    </Avatar>
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
