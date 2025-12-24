import {useState} from 'react';
import {useGetEventSubscribersQuery} from '@/services/api/eventApi.ts';

interface UseParticipantsModalOutput {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    participants: Array<{
        id: string;
        name: string | null;
        avatarUrl: string | null;
        isContact?: boolean;
    }>;
    totalCount: number;
    isLoading: boolean;
    error: unknown;
}

export const useParticipantsModal = (eventId: string | null, count: number = 50): UseParticipantsModalOutput => {
    const [isOpen, setIsOpen] = useState(false);

    const {data, isLoading, error} = useGetEventSubscribersQuery(
        {
            eventId: eventId ?? '',
            count: count,
        },
        {
            skip: !eventId || !isOpen,
        }
    );

    const participants = data?.res?.users || [];
    const totalCount = data?.res?.totalCount || 0;

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

