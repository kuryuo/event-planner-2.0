import type {EventContentArg as FullCalendarEventContentArg} from '@fullcalendar/core';
import styles from './CalendarEvent.module.scss';
import {formatTimeRange} from '@/utils';

interface CalendarEventProps {
    arg: FullCalendarEventContentArg;
    viewType: 'dayGridMonth' | 'timeGridWeek';
}

export default function CalendarEvent({arg, viewType}: CalendarEventProps) {
    const {event, timeText} = arg;

    const displayTime = viewType === 'dayGridMonth'
        ? formatTimeRange(event.start, event.end)
        : timeText;

    return (
        <div className={styles.main}>
            <div className={styles.title}>{event.title}</div>
            <div className={styles.time}>{displayTime}</div>
        </div>
    );
}
