import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store/store.ts';
import type {EventData} from '@/types/api/Event.ts';

export interface CalendarEventProps {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

export const useCalendarEvents = () => {
    const events = useSelector((state: RootState) => state.event.events) as EventData[];

    // console.log('Events from Redux:', events);

    const calendarEvents: CalendarEventProps[] = useMemo(() => {
        const mapped = events.map(e => ({
            id: e.id!,
            title: e.name!,
            start: new Date(e.startDate ?? new Date().toISOString()),
            end: new Date(e.endDate ?? new Date().toISOString()),
        }));
        // console.log('CalendarEvents mapped:', mapped);
        return mapped;
    }, [events]);

    return {calendarEvents};
};
