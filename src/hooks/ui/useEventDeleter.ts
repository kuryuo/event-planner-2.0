import {useNavigate} from 'react-router-dom';
import {useDeleteEventMutation} from '@/services/api/eventApi.ts';

export interface UseEventDeleterOutput {
    handleDelete: (eventId: string) => Promise<void>;
    isLoading: boolean;
    error: string | null | undefined;
}

export const useEventDeleter = (): UseEventDeleterOutput => {
    const navigate = useNavigate();
    const [deleteEventMutation, {isLoading, error}] = useDeleteEventMutation();

    const handleDelete = async (eventId: string) => {
        try {
            await deleteEventMutation(eventId).unwrap();
            console.log('Событие успешно удалено');
            navigate('/main');
        } catch (err: any) {
            console.error('Ошибка удаления события:', err);
            const errorMessage = err?.data?.message || err?.message || 'Произошла ошибка при удалении';
            throw new Error(errorMessage);
        }
    };

    return {
        handleDelete,
        isLoading,
        error: error as string | null | undefined,
    };
};
