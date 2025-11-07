import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import CalendarHeader from "@/components/calendar/header/CalendarHeader.tsx";
import './CalendarBody.module.scss'

interface CalendarBodyProps {
    calendarRef: React.RefObject<FullCalendar | null>;
    currentView: 'dayGridMonth' | 'timeGridWeek';
}

export default function CalendarBody({ calendarRef, currentView }: CalendarBodyProps) {
    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            locale={ruLocale}
            headerToolbar={false}
            allDaySlot={false}
            slotMinTime="09:00:00"
            slotMaxTime="23:00:00"
            slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }}
            dayHeaderContent={(args) => (
                <CalendarHeader {...args} currentView={currentView} />
            )}
            events={[
                { title: 'Событие 1', start: '2025-11-06T10:00:00', end: '2025-11-06T12:00:00' },
                { title: 'Событие 2', start: '2025-11-07T14:00:00', end: '2025-11-07T16:00:00' },
            ]}
            height="auto"
            nowIndicator
            editable
            selectable
        />
    );
}
