import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import CalendarHeader from '@/components/calendar/header/CalendarHeader';
import CalendarEvent from '@/components/calendar/event/CalendarEvent';
import styles from './CalendarBody.module.scss';
import {useEventsData} from '@/hooks/api/useEventsData.ts';

void styles;
import type {EventClickArg, EventApi} from "@fullcalendar/core";
import {useNavigate} from "react-router-dom";
import type {GetEventsPayload} from '@/types/api/Event.ts';

import {SLOT_LABEL_FORMAT, CALENDAR_SLOT_TIMES, CALENDAR_OPTIONS, hexToAppColor} from '@/const';

interface CalendarBodyProps {
    calendarRef: React.RefObject<FullCalendar | null>;
    currentView: 'dayGridMonth' | 'timeGridWeek';
    filters?: GetEventsPayload;
}

export default function CalendarBody({calendarRef, currentView, filters}: CalendarBodyProps) {
    const navigate = useNavigate();
    const {calendarEvents} = useEventsData(filters);

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
            events={calendarEvents}
            eventClick={handleClick}
            datesSet={handleDatesSet}
            eventDidMount={handleEventDidMount}
            {...CALENDAR_OPTIONS}
        />
    );
}
