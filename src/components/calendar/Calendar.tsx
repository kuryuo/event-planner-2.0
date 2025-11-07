import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import styles from './Calendar.module.scss';
import CalendarToolbar from '../calendar/toolbar/CalendarToolbar.tsx';
import CalendarHeader from "@/components/calendar/header/CalendarHeader.tsx";

export default function Calendar() {
    const calendarRef = useRef<FullCalendar | null>(null);
    const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek') => {
        setCurrentView(view);
        calendarRef.current?.getApi().changeView(view);
    };

    const goToPrevious = () => {
        const prev = new Date(currentDate);

        if (currentView === 'dayGridMonth') {
            prev.setMonth(prev.getMonth() - 1);
        } else if (currentView === 'timeGridWeek') {
            prev.setDate(prev.getDate() - 7);
            prev.setDate(prev.getDate() - prev.getDay() + 1);
        }

        setCurrentDate(prev);
        calendarRef.current?.getApi().gotoDate(prev);
    };

    const goToNext = () => {
        const next = new Date(currentDate);

        if (currentView === 'dayGridMonth') {
            next.setMonth(next.getMonth() + 1);
        } else if (currentView === 'timeGridWeek') {
            next.setDate(next.getDate() + 7);
            next.setDate(next.getDate() - next.getDay() + 1);
        }

        setCurrentDate(next);
        calendarRef.current?.getApi().gotoDate(next);
    };


    return (
        <div className={styles.calendarWrapper}>
            <CalendarToolbar
                currentView={currentView}
                currentDate={currentDate}
                onViewChange={handleViewChange}
                onPrev={goToPrevious}
                onNext={goToNext}
            />
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={currentView}
                locale={ruLocale}
                headerToolbar={false}
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
        </div>
    );
}
