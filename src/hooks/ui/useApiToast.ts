import {useCallback} from 'react';
import {useToast} from '@/components/toast/ToastProvider.tsx';
import {getApiErrorMessage} from '@/utils/apiError.ts';

export const useApiToast = () => {
    const {showToast, clearToasts} = useToast();

    const showApiError = useCallback((error: unknown, fallback?: string) => {
        showToast({
            type: 'error',
            message: getApiErrorMessage(error, fallback),
        });
    }, [showToast]);

    const showSuccess = useCallback((message: string) => {
        showToast({type: 'success', message});
    }, [showToast]);

    const showWarning = useCallback((message: string) => {
        showToast({type: 'warning', message});
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast({type: 'info', message});
    }, [showToast]);

    return {
        showToast,
        showApiError,
        showSuccess,
        showWarning,
        showInfo,
        clearToasts,
    };
};
