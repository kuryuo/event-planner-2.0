import {useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useGetEventByIdQuery} from '@/services/api/eventApi.ts';
import {formatDateTimeRange} from '@/utils/date.ts';

export interface UseEventPageOutput {
    event: {
        id: string;
        name: string;
        description: string;
        location: string;
        formattedDate: string;
        categories: Array<{ text: string }>;
    } | null;
    isLoading: boolean;
    error: unknown;
}

export const useEventPage = (): UseEventPageOutput => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('id');

    const {data, isLoading, error} = useGetEventByIdQuery(eventId ?? '', {skip: !eventId});

    const event = useMemo(() => {
        if (!data?.result) return null;

        const eventData = data.result;

        return {
            id: eventData.id,
            name: eventData.name,
            description: eventData.description ?? '',
            location: eventData.location,
            formattedDate: eventData.startDate && eventData.endDate
                ? formatDateTimeRange(eventData.startDate, eventData.endDate)
                : '',
            categories: eventData.categories?.map(cat => ({text: cat})) ?? [],
        };
    }, [data]);

    return {
        event,
        isLoading,
        error,
    };
};