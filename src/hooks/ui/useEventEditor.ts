import {useCreateEventMutation} from '@/services/api/eventApi.ts';
import type {CreateEventPayload} from '@/types/api/Event.ts';

export interface UseEventEditorOutput {
    handleSubmit: (payload: CreateEventPayload) => Promise<void>;
    isLoading: boolean;
    error: string | null | undefined;
}

export const useEventEditor = (): UseEventEditorOutput => {
    const [createEventMutation, {isLoading, error}] = useCreateEventMutation();

    const handleSubmit = async (payload: CreateEventPayload) => {
        try {
            await createEventMutation(payload);
            console.log('Событие успешно создано');
        } catch (err) {
            console.error('Ошибка создания события:', err);
        }
    };

    return {
        handleSubmit,
        isLoading,
        error: error as string | null | undefined,
    };
};