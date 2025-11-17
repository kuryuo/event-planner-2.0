import {useGetEventsQuery} from '@/services/api/eventApi';
import type {GetEventsPayload} from "@/types/api/Event.ts";

export interface CalendarEventProps {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

export const useEvents = (filters?: Partial<GetEventsPayload>) => {
    const payload = {count: 10, ...filters};

    const {data, isLoading, error} = useGetEventsQuery(payload);

    const events: CalendarEventProps[] = (data?.result.map(evt => ({
        id: evt.id ?? 'no-id',
        title: evt.name || 'Без названия',
        start: new Date(evt.startDate ?? new Date().toISOString()),
        end: new Date(evt.endDate ?? new Date().toISOString()),
    })) ?? []);

    console.log('API events:', data?.result);
    console.log('Calendar events:', events);

    return {events, isLoading, error};
};
