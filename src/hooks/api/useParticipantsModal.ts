import {useState, useMemo} from 'react';
import {useGetEventSubscribersQuery} from '@/services/api/eventApi.ts';

interface UseParticipantsModalFilters {
    name?: string;
    role?: string;
    inContacts?: boolean;
}

interface UseParticipantsModalOutput {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    participants: Array<{
        id: string;
        name: string | null;
        avatarUrl: string | null;
        role?: string | null;
        isContact?: boolean;
    }>;
    totalCount: number;
    isLoading: boolean;
    error: unknown;
}

export const useParticipantsModal = (
    eventId: string | null,
    filters: UseParticipantsModalFilters = {},
    count: number = 50
): UseParticipantsModalOutput => {
    const [isOpen, setIsOpen] = useState(false);

    const {data, isLoading, error} = useGetEventSubscribersQuery(
        {
            eventId: eventId ?? '',
            count: count,
            name: filters.name || undefined,
            role: filters.role || undefined,
        },
        {
            skip: !eventId || !isOpen,
        }
    );

    const allParticipants = data?.res?.users || [];
    const serverTotalCount = data?.res?.totalCount || 0;

    const participants = useMemo(() => {
        if (filters.inContacts === undefined) {
            return allParticipants;
        }
        return allParticipants.filter(p => 
            filters.inContacts ? p.isContact === true : true
        );
    }, [allParticipants, filters.inContacts]);

    const totalCount = useMemo(() => {
        if (filters.inContacts === undefined) {
            return serverTotalCount;
        }
        return participants.length;
    }, [serverTotalCount, participants.length, filters.inContacts]);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        openModal,
        closeModal,
        participants,
        totalCount,
        isLoading,
        error,
    };
};

