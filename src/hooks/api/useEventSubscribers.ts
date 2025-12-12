import {useMemo} from 'react';
import {useGetEventSubscribersQuery} from '@/services/api/eventApi.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';

export interface Participant {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface UseEventSubscribersOutput {
    participants: Participant[];
    isLoading: boolean;
    error: unknown;
}

export const useEventSubscribers = (eventId: string | null): UseEventSubscribersOutput => {
    const {data, isLoading, error} = useGetEventSubscribersQuery(
        {eventId: eventId ?? ''},
        {skip: !eventId}
    );

    const participants = useMemo(() => {
        if (!data?.result) return [];

        return data.result.map(subscriber => ({
            id: subscriber.id,
            name: `${subscriber.lastName ?? ''} ${subscriber.firstName ?? ''} ${subscriber.middleName ?? ''}`.trim(),
            avatarUrl: buildImageUrl(subscriber.avatarUrl) ?? undefined,
        }));
    }, [data]);

    return {
        participants,
        isLoading,
        error,
    };
};
