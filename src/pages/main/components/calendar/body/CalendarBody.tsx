import {useMemo} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import CalendarHeader from '../header/CalendarHeader';
import CalendarEvent from '../event/CalendarEvent';
import styles from './CalendarBody.module.scss';
import {useEventsData} from '@/hooks/api/useEventsData.ts';
import type {EventClickArg, EventApi} from "@fullcalendar/core";
import {useNavigate} from "react-router-dom";
import type {GetEventsPayload} from '@/types/api/Event.ts';

import {SLOT_LABEL_FORMAT, CALENDAR_SLOT_TIMES, CALENDAR_OPTIONS, hexToAppColor} from '@/const';

/** В месячном виде FullCalendar тянет «полосой» только all-day; для timed — отрывки по дням. */
const toMonthAllDaySpan = (
    ev: {id: string; title: string; start: Date; end: Date; extendedProps?: {color?: string}},
) => {
    const start = ev.start instanceof Date ? ev.start : new Date(ev.start);
    const end = ev.end instanceof Date ? ev.end : new Date(ev.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return {...ev, allDay: false as const};
    }
    if (end.getTime() < start.getTime()) {
        return {...ev, allDay: false as const};
    }

    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const exclusiveEnd = new Date(endDay);
    exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);

    return {
        ...ev,
        allDay: true as const,
        start: startDay,
        end: exclusiveEnd,
        extendedProps: {
            ...ev.extendedProps,
            realStart: new Date(start.getTime()),
            realEnd: new Date(end.getTime()),
        },
    };
};

interface CalendarBodyProps {
    calendarRef: React.RefObject<FullCalendar | null>;
    currentView: 'dayGridMonth' | 'timeGridWeek';
    filters?: GetEventsPayload;
}

export default function CalendarBody({calendarRef, currentView, filters}: CalendarBodyProps) {
    const navigate = useNavigate();
    const {calendarEvents} = useEventsData(filters);

    const eventsForCalendar = useMemo(() => {
        if (currentView !== 'dayGridMonth') return calendarEvents;
        return calendarEvents.map(toMonthAllDaySpan);
    }, [calendarEvents, currentView]);

    const handleClick = (event: EventClickArg) => {
        navigate('/event?id=' + event.event.id)
    }

    const handleDatesSet = () => {
        const rows = document.querySelectorAll('.fc-daygrid-body tr');
        const weeks = rows.length;

        const calendar = document.querySelector('.fc');
        if (!calendar) return;

        calendar.classList.remove('weeks-4', 'weeks-5', 'weeks-6');
        calendar.classList.add(`weeks-${weeks}`);
    };

    const handleEventDidMount = (arg: { event: EventApi; el: HTMLElement }) => {
        const eventColor = (arg.event.extendedProps as { color?: string })?.color;
        const appColor = hexToAppColor(eventColor);
        arg.el.style.setProperty('--event-bg-color', `var(--bg-${appColor})`);
        arg.el.style.setProperty('--event-content-color', `var(--content-${appColor})`);
    };

    return (
        <div className={styles.calendarBody}>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                locale={ruLocale}
                headerToolbar={false}
                slotMinTime={CALENDAR_SLOT_TIMES.min}
                slotMaxTime={CALENDAR_SLOT_TIMES.max}
                slotLabelFormat={SLOT_LABEL_FORMAT}
                dayHeaderContent={(args) => <CalendarHeader {...args} currentView={currentView}/>}
                eventContent={(arg) => <CalendarEvent arg={arg} viewType={currentView}/>}
                events={eventsForCalendar}
                eventClick={handleClick}
                datesSet={handleDatesSet}
                eventDidMount={handleEventDidMount}
                {...CALENDAR_OPTIONS}
                {...(currentView === 'dayGridMonth' ? {eventDisplay: 'block' as const} : {})}
            />
        </div>
    );
}
