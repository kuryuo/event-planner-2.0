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
        if (!data?.res?.users || !Array.isArray(data.res.users)) return [];

        return data.res.users.map((subscriber, index) => ({
            id: subscriber.id,
            name: subscriber.name?.trim() || `Пользователь ${index + 1}`,
            avatarUrl: buildImageUrl(subscriber.avatarUrl) ?? undefined,
        }));
    }, [data]);

    if (data) {
        console.log("Fetched event subscribers:", data);
    }

    return {
        participants,
        isLoading,
        error,
    };
};
