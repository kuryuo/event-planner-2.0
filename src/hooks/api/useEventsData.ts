import {useMemo} from 'react';
import {useGetEventsQuery} from '@/services/api/eventApi.ts';
import type {EventResponse} from '@/types/api/Event.ts';

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
    const {data} = useGetEventsQuery({count: 50});

    const {calendarEvents, listEvents} = useMemo(() => {
        const events = (data?.result || []) as EventResponse[];
        const calendarEvents = events.map(e => ({
            id: e.id,
            title: e.name,
            start: new Date(e.startDate),
            end: new Date(e.endDate),
        }));

        const listEvents = events.map(e => {
            const start = new Date(e.startDate);
            const end = new Date(e.endDate);

            const date = start.toISOString().split('T')[0];
            const time = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`;

            return {
                id: e.id,
                date,
                time,
                title: e.name,
                description: e.description ?? '',
            };
        });

        return {calendarEvents, listEvents};
    }, [data]);

    return {calendarEvents, listEvents};
};