import {useMemo} from 'react';
import {useGetEventsQuery, useGetMyEventsQuery} from '@/services/api/eventApi.ts';
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
        endDate: string | null;
        location: string;
        categories: string[];
        responsiblePersonId: string;
    }[];
}

export const useEventsData = (filters?: GetEventsPayload): UseEventsOutput => {
    const payload: GetEventsPayload = filters || {Count: 50};
    const isMyEvents = !!payload.MyEvents;

    const queryPayload = useMemo(() => {
        if (!isMyEvents) {
            return payload;
        }

        const {MyEvents, ...rest} = payload;
        return rest;
    }, [payload, isMyEvents]);

    const {data: allEventsData} = useGetEventsQuery(queryPayload, {skip: isMyEvents});
    const {data: myEventsData} = useGetMyEventsQuery(undefined, {skip: !isMyEvents});
    const data = isMyEvents ? myEventsData : allEventsData;

    const {calendarEvents, listEvents} = useMemo(() => {
        const events = (data?.result || []) as EventResponse[];
        const calendarEvents = events.map(e => ({
            id: e.id,
            title: e.name,
            start: new Date(e.startDate),
            end: new Date(e.endDate ?? e.startDate),
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
                responsiblePersonId: e.responsiblePersonId ?? '',
            };
        });

        return {calendarEvents, listEvents};
    }, [data]);

    return {calendarEvents, listEvents};
};
