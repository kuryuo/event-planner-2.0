import {useMemo} from 'react';
import {useGetEventsQuery} from '@/services/api/eventApi.ts';
import type {EventResponse, GetEventsPayload} from '@/types/api/Event.ts';

export interface UseEventsOutput {
    calendarEvents: {
        id: string;
        title: string;
        start: Date;
        end: Date;
        extendedProps?: {
            color?: string;
        };
    }[];
    listEvents: {
        id: string;
        title: string;
        description: string;
        avatar?: string | null;
        startDate: string;
        endDate: string;
        location: string;
        categories: string[];
        responsiblePersonId: string;
    }[];
}

export const useEventsData = (filters?: GetEventsPayload): UseEventsOutput => {
    const payload: GetEventsPayload = filters || {Count: 50};
    const {data} = useGetEventsQuery(payload);

    const {calendarEvents, listEvents} = useMemo(() => {
        const events = (data?.result || []) as EventResponse[];
        const calendarEvents = events.map(e => ({
            id: e.id,
            title: e.name,
            start: new Date(e.startDate),
            end: new Date(e.endDate),
            extendedProps: {
                color: e.color,
            },
        }));

        const listEvents = events.map(e => {
            return {
                id: e.id,
                title: e.name,
                description: e.description ?? '',
                avatar: e.avatar,
                startDate: e.startDate,
                endDate: e.endDate,
                location: e.location,
                categories: e.categories ?? [],
                responsiblePersonId: e.responsiblePersonId,
            };
        });

        return {calendarEvents, listEvents};
    }, [data]);

    return {calendarEvents, listEvents};
};
