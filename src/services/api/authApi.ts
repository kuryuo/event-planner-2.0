import {baseApi} from './baseApi';
import type {
    RegisterPayload,
    LoginPayload,
    AuthResponse,
    RefreshPayload,
    RefreshResponse,
    RecoverPayload
} from '@/types/api/Auth';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<AuthResponse, RegisterPayload>({
            query: (body) => ({
                url: 'auth/register',
                method: 'POST',
                body,
            }),
        }),

        login: builder.mutation<AuthResponse, LoginPayload>({
            query: (body) => ({
                url: 'auth/login',
                method: 'POST',
                body,
            }),
        }),

        refresh: builder.mutation<RefreshResponse, RefreshPayload>({
            query: (body) => ({
                url: 'auth/refresh',
                method: 'POST',
                body,
            }),
        }),

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

export const {useRegisterMutation, useLoginMutation, useRefreshMutation, useRecoverPasswordMutation} = authApi;
