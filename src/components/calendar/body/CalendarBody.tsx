import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import CalendarHeader from '@/components/calendar/header/CalendarHeader';
import CalendarEvent from '@/components/calendar/event/CalendarEvent';
import './CalendarBody.module.scss';
import type {CalendarEventProps} from "@/hooks/useEvents.ts";

import {SLOT_LABEL_FORMAT, CALENDAR_SLOT_TIMES, CALENDAR_OPTIONS} from '@/const';

interface CalendarBodyProps {
    calendarRef: React.RefObject<FullCalendar | null>;
    currentView: 'dayGridMonth' | 'timeGridWeek';
    events: CalendarEventProps[];
}

export default function CalendarBody({calendarRef, currentView, events}: CalendarBodyProps) {

    const handleDatesSet = () => {
        const rows = document.querySelectorAll('.fc-daygrid-body tr');
        const weeks = rows.length;

        const calendar = document.querySelector('.fc');
        if (!calendar) return;

        calendar.classList.remove('weeks-4', 'weeks-5', 'weeks-6');
        calendar.classList.add(`weeks-${weeks}`);
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
            events={events}
            datesSet={handleDatesSet}
            {...CALENDAR_OPTIONS}
        />
    );
}
