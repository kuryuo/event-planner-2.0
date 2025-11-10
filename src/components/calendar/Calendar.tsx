import {useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import CalendarToolbar from '../calendar/toolbar/CalendarToolbar.tsx';
import CalendarBody from './body/CalendarBody.tsx';
import styles from './Calendar.module.scss';

export default function Calendar() {
    const calendarRef = useRef<FullCalendar | null>(null);

    const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');

    const [monthDate, setMonthDate] = useState(new Date());
    const [weekDate, setWeekDate] = useState(new Date());

    const currentDate = currentView === 'dayGridMonth' ? monthDate : weekDate;

    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek') => {
        setCurrentView(view);

        const dateToShow = view === 'dayGridMonth' ? monthDate : weekDate;
        calendarRef.current?.getApi().changeView(view);
        calendarRef.current?.getApi().gotoDate(dateToShow);
    };

    const goToPrevious = () => {
        if (currentView === 'dayGridMonth') {
            const prev = new Date(monthDate);
            prev.setMonth(prev.getMonth() - 1);
            setMonthDate(prev);
            calendarRef.current?.getApi().gotoDate(prev);
        } else {
            const prev = new Date(weekDate);
            prev.setDate(prev.getDate() - 7);
            prev.setDate(prev.getDate() - prev.getDay() + 1);
            setWeekDate(prev);
            calendarRef.current?.getApi().gotoDate(prev);
        }
    };

    const goToNext = () => {
        if (currentView === 'dayGridMonth') {
            const next = new Date(monthDate);
            next.setMonth(next.getMonth() + 1);
            setMonthDate(next);
            calendarRef.current?.getApi().gotoDate(next);
        } else {
            const next = new Date(weekDate);
            next.setDate(next.getDate() + 7);
            next.setDate(next.getDate() - next.getDay() + 1);
            setWeekDate(next);
            calendarRef.current?.getApi().gotoDate(next);
        }
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
            <CalendarBody
                calendarRef={calendarRef}
                currentView={currentView}
            />
        </div>
    );
}
