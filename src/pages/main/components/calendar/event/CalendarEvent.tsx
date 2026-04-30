import type {EventContentArg as FullCalendarEventContentArg} from '@fullcalendar/core';
import styles from './CalendarEvent.module.scss';
import {formatTimeRange} from '@/utils';

interface CalendarEventProps {
    arg: FullCalendarEventContentArg;
    viewType: 'dayGridMonth' | 'timeGridWeek';
}

export default function CalendarEvent({arg, viewType}: CalendarEventProps) {
    const {event, timeText} = arg;

    const props = event.extendedProps as {realStart?: Date; realEnd?: Date} | undefined;
    const rangeStart = props?.realStart ?? event.start;
    const rangeEnd = props?.realEnd ?? event.end;

    const displayTime = viewType === 'dayGridMonth'
        ? formatTimeRange(rangeStart, rangeEnd)
        : timeText;

    return (
        <div className={styles.main}>
            <div className={styles.title}>{event.title}</div>
            <div className={styles.time}>{displayTime}</div>
        </div>
    );
}
