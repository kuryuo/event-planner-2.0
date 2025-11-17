import {createApi, fetchBaseQuery, type BaseQueryFn} from '@reduxjs/toolkit/query/react';
import type {RefreshPayload, RefreshResponse} from '@/types/api/Auth';
import {setTokens, clearTokens} from '@/store/authSlice';
import type {RootState} from "@/store/store.ts";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: 'http://95.82.231.190:5002/api/',
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
});

const baseQueryWithRefresh: BaseQueryFn = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (!refreshToken) {
            api.dispatch(clearTokens());
            return result;
        }

        const refreshResult = await rawBaseQuery(
            {
                url: 'auth/refresh',
                method: 'POST',
                body: {refreshToken} as RefreshPayload,
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const newTokens = refreshResult.data as RefreshResponse;
            api.dispatch(setTokens(newTokens));

            result = await rawBaseQuery(args, api, extraOptions);
        } else {
            api.dispatch(clearTokens());
        }
    }

    return result;
};

export const baseApi = createApi({
    baseQuery: baseQueryWithRefresh,
    tagTypes: [],
    endpoints: () => ({}),
});
