import {baseApi} from './baseApi';
import type {
    RegisterPayload,
    LoginPayload,
    AuthResponse,
    RefreshPayload,
    RecoverPayload
} from '@/types/api/Auth';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Регистрация нового пользователя
         */
        register: builder.mutation<AuthResponse, RegisterPayload>({
            query: (body) => ({
                url: 'auth/register',
                method: 'POST',
                body,
            }),
        }),
        /**
         * Авторизация пользователя
         */
        login: builder.mutation<AuthResponse, LoginPayload>({
            query: (body) => ({
                url: 'auth/login',
                method: 'POST',
                body,
            }),
        }),
        /**
         * Обновление access/refresh токенов
         */
        refresh: builder.mutation<AuthResponse, RefreshPayload>({
            query: (body) => ({
                url: 'auth/refresh',
                method: 'POST',
                body,
            }),
        }),
        /**
         * Восстановление пароля (отправка письма)
         */
        recoverPassword: builder.mutation<void, RecoverPayload>({
            query: (body) => ({
                url: 'auth/recover-password',
                method: 'POST',
                body,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useRefreshMutation,
    useRecoverPasswordMutation
} = authApi;
