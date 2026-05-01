import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import type {SerializedError} from '@reduxjs/toolkit';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const readStringField = (record: Record<string, unknown>, key: string): string | undefined => {
    const value = record[key];
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

export const getApiErrorMessage = (
    error: unknown,
    fallback = 'Произошла ошибка',
): string => {
    if (typeof error === 'string' && error.trim()) {
        return error.trim();
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message.trim();
    }

    if (!isRecord(error)) {
        return fallback;
    }

    if ('data' in error) {
        const data = (error as FetchBaseQueryError).data;

        if (typeof data === 'string' && data.trim()) {
            return data.trim();
        }

        if (isRecord(data)) {
            const fromError = readStringField(data, 'error');
            if (fromError) {
                return fromError;
            }

            const fromMessage = readStringField(data, 'message');
            if (fromMessage) {
                return fromMessage;
            }
        }
    }

    if ('message' in error) {
        const message = (error as SerializedError).message;
        if (typeof message === 'string' && message.trim()) {
            return message.trim();
        }
    }

    return fallback;
};
