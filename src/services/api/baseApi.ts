import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {RootState} from '@/store/store';
import {setTokens, clearTokens} from '@/store/authSlice';
import type {AuthTokens} from '@/types/api/Auth';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: 'https://cpbeventplanner.ru/api/',
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
});

export const baseApi = createApi({
    baseQuery: async (args, api, extraOptions) => {
        console.log('➡️ Выполняем запрос:', args);

        let result = await rawBaseQuery(args, api, extraOptions);

        if (result.error && result.error.status === 401) {
            console.log('⚠️ Получена 401, пытаемся обновить токен...');
            const refreshToken = (api.getState() as RootState).auth.refreshToken;

            if (refreshToken) {
                const refreshResult = await rawBaseQuery(
                    {url: 'auth/refresh', method: 'POST', body: {refreshToken}},
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    const tokens = refreshResult.data as AuthTokens;
                    console.log('✅ Токен обновлён:', tokens);
                    api.dispatch(setTokens(tokens));

                    console.log('🔄 Повторяем исходный запрос после обновления токена');
                    result = await rawBaseQuery(args, api, extraOptions);
                } else {
                    console.log('❌ Не удалось обновить токен, выполняем logout');
                    api.dispatch(clearTokens());
                }
            } else {
                console.log('❌ Нет refresh токена, выполняем logout');
                api.dispatch(clearTokens());
            }
        }

        console.log('⬅️ Результат запроса:', result);
        return result;
    },

    tagTypes: [],
    endpoints: () => ({}),
});

