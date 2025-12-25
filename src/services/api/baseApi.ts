import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {RootState} from '@/store/store'
import {setTokens, clearTokens} from '@/store/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cpbeventplanner.ru'

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/`,
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.accessToken
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
})

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {

    let result: any = await rawBaseQuery(args, api, extraOptions)

    if (result.error?.status === 401) {

        const refreshToken = (api.getState() as RootState).auth.refreshToken
        if (!refreshToken) {
            api.dispatch(clearTokens())
            return result
        }

        const refreshResult: any = await rawBaseQuery(
            {url: 'auth/refresh', method: 'POST', body: {refreshToken}},
            api,
            extraOptions
        )

        if (!refreshResult.data?.data) {
            api.dispatch(clearTokens())
            return result
        }

        const newTokens = refreshResult.data.data

        api.dispatch(setTokens(newTokens))

        const newArgs =
            typeof args === 'string'
                ? {url: args, headers: {Authorization: `Bearer ${newTokens.accessToken}`}}
                : {...args, headers: {...(args.headers || {}), Authorization: `Bearer ${newTokens.accessToken}`}}
        result = await rawBaseQuery(newArgs, api, extraOptions)
    }

    return result
}

export const baseApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Event', 'Profile', 'EventPost', 'Category'],
    endpoints: () => ({}),
})
