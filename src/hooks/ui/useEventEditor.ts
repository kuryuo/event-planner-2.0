import {useNavigate} from 'react-router-dom';
import {
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useUploadEventAvatarMutation
} from '@/services/api/eventApi.ts';
import type {CreateEventPayload, UpdateEventPayload} from '@/types/api/Event.ts';
import {useApiToast} from '@/hooks/ui/useApiToast.ts';

export interface UseEventEditorOutput {
    handleSubmit: (payload: CreateEventPayload | UpdateEventPayload) => Promise<void>;
    handleDelete: (eventId: string) => Promise<void>;
    isLoading: boolean;
    isDeleting: boolean;
    error: string | null | undefined;
}

export const useEventEditor = (eventId?: string): UseEventEditorOutput => {
    const navigate = useNavigate();
    const {showApiError, showSuccess} = useApiToast();
    const [createEventMutation, {isLoading: isCreating, error: createError}] = useCreateEventMutation();
    const [updateEventMutation, {isLoading: isUpdating, error: updateError}] = useUpdateEventMutation();
    const [deleteEventMutation, {isLoading: isDeleting, error: deleteError}] = useDeleteEventMutation();
    const [uploadAvatarMutation, {isLoading: isUploadingAvatar}] = useUploadEventAvatarMutation();

    const isLoading = isCreating || isUpdating || isUploadingAvatar;
    const error = createError || updateError || deleteError;

    const handleSubmit = async (payload: CreateEventPayload | UpdateEventPayload) => {
        try {
            const avatar = payload.avatar;
            
            if (eventId) {
                const {avatar: _, ...updatePayload} = payload as UpdateEventPayload;
                await updateEventMutation({eventId, body: updatePayload}).unwrap();

                if (avatar) {
                    await uploadAvatarMutation({eventId, avatar}).unwrap();
                }

                showSuccess('Мероприятие успешно обновлено');
            } else {
                const createPayload = payload as CreateEventPayload;
                const result = await createEventMutation(createPayload).unwrap();
                
                if (avatar && result?.result?.id) {
                    await uploadAvatarMutation({eventId: result.result.id, avatar}).unwrap();
                }

                showSuccess('Мероприятие успешно создано');
            }
            navigate('/main');
        } catch (err) {
            console.error('Ошибка сохранения события:', err);
            showApiError(err, 'Не удалось сохранить мероприятие');
        }
    };

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
        handleSubmit,
        handleDelete,
        isLoading,
        isDeleting,
        error: error as string | null | undefined,
    };
};
