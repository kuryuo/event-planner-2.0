import type { DayHeaderContentArg } from '@fullcalendar/core';
import styles from './CalendarHeader.module.scss';
import {useI18n} from '@/i18n/I18nProvider';

interface CalendarDayHeaderProps extends DayHeaderContentArg {
    currentView: 'dayGridMonth' | 'timeGridWeek';
}

export default function CalendarHeader({ date, text, currentView }: CalendarDayHeaderProps) {
    const {language} = useI18n();
    if (currentView === 'timeGridWeek') {
        const dayName = date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' });
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
