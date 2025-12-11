import {useNavigate} from 'react-router-dom';
import {useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation} from '@/services/api/eventApi.ts';
import type {CreateEventPayload, UpdateEventPayload} from '@/types/api/Event.ts';

export interface UseEventEditorOutput {
    handleSubmit: (payload: CreateEventPayload | UpdateEventPayload) => Promise<void>;
    handleDelete: (eventId: string) => Promise<void>;
    isLoading: boolean;
    isDeleting: boolean;
    error: string | null | undefined;
}

export const useEventEditor = (eventId?: string): UseEventEditorOutput => {
    const navigate = useNavigate();
    const [createEventMutation, {isLoading: isCreating, error: createError}] = useCreateEventMutation();
    const [updateEventMutation, {isLoading: isUpdating, error: updateError}] = useUpdateEventMutation();
    const [deleteEventMutation, {isLoading: isDeleting, error: deleteError}] = useDeleteEventMutation();

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError || deleteError;

    const handleSubmit = async (payload: CreateEventPayload | UpdateEventPayload) => {
        try {
            if (eventId) {
                await updateEventMutation({eventId, body: payload as UpdateEventPayload}).unwrap();
                console.log('Событие успешно обновлено');
            } else {
                await createEventMutation(payload as CreateEventPayload).unwrap();
                console.log('Событие успешно создано');
            }
            navigate('/main');
        } catch (err) {
            console.error('Ошибка сохранения события:', err);
        }
    };

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
        handleSubmit,
        handleDelete,
        isLoading,
        isDeleting,
        error: error as string | null | undefined,
    };
};