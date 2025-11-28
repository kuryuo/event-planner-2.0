import {useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import CalendarToolbar from '../calendar/toolbar/CalendarToolbar';
import CalendarBody from './body/CalendarBody';
import styles from './Calendar.module.scss';
import {shiftMonth, shiftWeek} from '@/utils';
import EventsList from "@/components/events-list/EventsList.tsx";
import {useEventsData} from '@/hooks/transform/useEventsData.ts';

interface CalendarProps {
    onFilterClick?: () => void;
}

export default function Calendar({onFilterClick}: CalendarProps) {
    const calendarRef = useRef<FullCalendar | null>(null);

    const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
    const [monthDate, setMonthDate] = useState(new Date());
    const [weekDate, setWeekDate] = useState(new Date());
    const [showEventsList, setShowEventsList] = useState(false);

    const handleViewStackedClick = () => {
        setShowEventsList(prev => !prev);
    };

    const {listEvents} = useEventsData();

    const currentDate = currentView === 'dayGridMonth' ? monthDate : weekDate;

    const goToPrevious = () => {
        if (currentView === 'dayGridMonth') {
            const prev = shiftMonth(monthDate, -1);
            setMonthDate(prev);
            calendarRef.current?.getApi().gotoDate(prev);
        } else {
            const prev = shiftWeek(weekDate, -1);
            setWeekDate(prev);
            calendarRef.current?.getApi().gotoDate(prev);
        }
    };

    const goToNext = () => {
        if (currentView === 'dayGridMonth') {
            const next = shiftMonth(monthDate, 1);
            setMonthDate(next);
            calendarRef.current?.getApi().gotoDate(next);
        } else {
            const next = shiftWeek(weekDate, 1);
            setWeekDate(next);
            calendarRef.current?.getApi().gotoDate(next);
        }
    };

    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek') => {
        setCurrentView(view);
        const dateToShow = view === 'dayGridMonth' ? monthDate : weekDate;
        calendarRef.current?.getApi().changeView(view);
        calendarRef.current?.getApi().gotoDate(dateToShow);
    };

    return (
        <div className={styles.calendarWrapper}>
            <CalendarToolbar
                currentView={currentView}
                currentDate={currentDate}
                onViewChange={handleViewChange}
                onPrev={goToPrevious}
                onNext={goToNext}
                onViewStackedClick={handleViewStackedClick}
                onFilterClick={onFilterClick}
                showingList={showEventsList}
            />

            {showEventsList ? (
                <EventsList events={listEvents}/>
            ) : (
                <CalendarBody
                    calendarRef={calendarRef}
                    currentView={currentView}
                />
            )}
        </div>

    );
}
