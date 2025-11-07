import type { DayHeaderContentArg } from '@fullcalendar/core';
import styles from './CalendarHeader.module.scss';

interface CalendarDayHeaderProps extends DayHeaderContentArg {
    currentView: 'dayGridMonth' | 'timeGridWeek';
}

export default function CalendarHeader({ date, text, currentView }: CalendarDayHeaderProps) {
    if (currentView === 'timeGridWeek') {
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        const dayNumber = date.getDate();

        return (
            <div className={styles.dayHeader}>
                <span className={styles.dayName}>{dayName}</span>
                <span className={styles.dayNumber}>{dayNumber}</span>
            </div>
        );
    }

    return <span>{text}</span>;
}
