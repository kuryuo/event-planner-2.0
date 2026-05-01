import {useNavigate} from 'react-router-dom';
import {useDeleteEventMutation} from '@/services/api/eventApi.ts';
import {useApiToast} from '@/hooks/ui/useApiToast.ts';

export interface UseEventDeleterOutput {
    handleDelete: (eventId: string) => Promise<void>;
    isLoading: boolean;
    error: string | null | undefined;
}

export const useEventDeleter = (): UseEventDeleterOutput => {
    const navigate = useNavigate();
    const {showApiError, showSuccess} = useApiToast();
    const [deleteEventMutation, {isLoading, error}] = useDeleteEventMutation();

    const handleDelete = async (eventId: string) => {
        try {
            await deleteEventMutation(eventId).unwrap();
            showSuccess('Мероприятие успешно удалено');
            navigate('/main');
        } catch (err) {
            console.error('Ошибка удаления события:', err);
            showApiError(err, 'Не удалось удалить мероприятие');
            throw err;
        }
    };

    return {
        handleDelete,
        isLoading,
        error: error as string | null | undefined,
    };
};
