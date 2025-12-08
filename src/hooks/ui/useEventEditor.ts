import {useNavigate} from 'react-router-dom';
import {useCreateEventMutation, useUpdateEventMutation} from '@/services/api/eventApi.ts';
import type {CreateEventPayload, UpdateEventPayload} from '@/types/api/Event.ts';

export interface UseEventEditorOutput {
    handleSubmit: (payload: CreateEventPayload | UpdateEventPayload) => Promise<void>;
    isLoading: boolean;
    error: string | null | undefined;
}

export const useEventEditor = (eventId?: string): UseEventEditorOutput => {
    const navigate = useNavigate();
    const [createEventMutation, {isLoading: isCreating, error: createError}] = useCreateEventMutation();
    const [updateEventMutation, {isLoading: isUpdating, error: updateError}] = useUpdateEventMutation();

    const isLoading = isCreating || isUpdating;
    const error = createError || updateError;

    const handleSubmit = async (payload: CreateEventPayload | UpdateEventPayload) => {
        try {
            if (eventId) {
                await updateEventMutation({eventId, body: payload as UpdateEventPayload});
                console.log('Событие успешно обновлено');
            } else {
                await createEventMutation(payload as CreateEventPayload);
                console.log('Событие успешно создано');
            }
            navigate('/main');
        } catch (err) {
            console.error('Ошибка сохранения события:', err);
        }
    };

    return {
        handleSubmit,
        isLoading,
        error: error as string | null | undefined,
    };
};