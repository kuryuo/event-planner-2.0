import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store/store.ts';
import type {EventData} from '@/types/api/Event.ts';

export interface UseEventsOutput {
    calendarEvents: {
        id: string;
        title: string;
        start: Date;
        end: Date;
    }[];
    listEvents: {
        id: string;
        date: string;
        time: string;
        title: string;
        description: string;
    }[];
}

export const useEventsData = (): UseEventsOutput => {
    const events = useSelector((state: RootState) => state.event.events) as EventData[];

    const {calendarEvents, listEvents} = useMemo(() => {
        const calendarEvents = events.map(e => ({
            id: e.id!,
            title: e.name!,
            start: new Date(e.startDate ?? new Date().toISOString()),
            end: new Date(e.endDate ?? new Date().toISOString()),
        }));

        const listEvents = events.map(e => {
            const start = new Date(e.startDate ?? new Date().toISOString());
            const end = new Date(e.endDate ?? new Date().toISOString());

            const date = start.toISOString().split('T')[0];
            const time = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`;

            return {
                id: e.id!,
                date,
                time,
                title: e.name!,
                description: e.description ?? '',
            };
        });

        return {calendarEvents, listEvents};
    }, [events]);

    return {calendarEvents, listEvents};
};
