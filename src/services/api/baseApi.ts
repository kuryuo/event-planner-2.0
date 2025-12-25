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

type PendingRequest = {
    resolve: (token: string) => void
    reject: (error: any) => void
}

let refreshPromise: Promise<string> | null = null
const pendingRequests: PendingRequest[] = []

const processQueue = (token: string | null, error: any = null) => {
    if (error) {
        console.log('[Auth] Refresh failed, rejecting', pendingRequests.length, 'pending requests')
        pendingRequests.forEach(({reject}) => reject(error))
    } else {
        console.log('[Auth] Refresh successful, resolving', pendingRequests.length, 'pending requests')
        pendingRequests.forEach(({resolve}) => resolve(token!))
    }
    pendingRequests.length = 0
}

const refreshToken = async (api: any, refreshTokenValue: string): Promise<string> => {
    console.log('[Auth] Starting token refresh')
    const refreshResult: any = await rawBaseQuery(
        {url: 'auth/refresh', method: 'POST', body: {refreshToken: refreshTokenValue}},
        api,
        {}
    )

    if (!refreshResult.data?.data) {
        console.log('[Auth] Token refresh failed: no data in response')
        api.dispatch(clearTokens())
        throw refreshResult
    }

    const newTokens = refreshResult.data.data
    api.dispatch(setTokens(newTokens))
    console.log('[Auth] Token refresh successful')
    return newTokens.accessToken
}

const retryRequest = (args: any, api: any, token: string) => {
    const newArgs =
        typeof args === 'string'
            ? {url: args, headers: {Authorization: `Bearer ${token}`}}
            : {...args, headers: {...(args.headers || {}), Authorization: `Bearer ${token}`}}
    return rawBaseQuery(newArgs, api, {})
}

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {
    let result: any = await rawBaseQuery(args, api, extraOptions)

    if (result.error?.status === 401) {
        const refreshTokenValue = (api.getState() as RootState).auth.refreshToken
        if (!refreshTokenValue) {
            console.log('[Auth] No refresh token available, clearing tokens')
            api.dispatch(clearTokens())
            return result
        }

        if (refreshPromise) {
            console.log('[Auth] Refresh in progress, adding request to queue. Queue size:', pendingRequests.length + 1)
            return new Promise((resolve, reject) => {
                pendingRequests.push({
                    resolve: async (token: string) => {
                        console.log('[Auth] Retrying request with new token from queue')
                        try {
                            resolve(await retryRequest(args, api, token))
                        } catch (error) {
                            reject(error)
                        }
                    },
                    reject: (error: any) => {
                        console.log('[Auth] Request rejected from queue due to refresh failure:', error)
                        reject(result)
                    }
                })
            })
        }

        console.log('[Auth] Initiating token refresh')
        refreshPromise = refreshToken(api, refreshTokenValue)
            .then((newToken) => {
                processQueue(newToken)
                return newToken
            })
            .catch((error) => {
                console.log('[Auth] Token refresh error:', error)
                processQueue(null, error)
                api.dispatch(clearTokens())
                throw error
            })
            .finally(() => {
                refreshPromise = null
            })

        try {
            const newToken = await refreshPromise
            console.log('[Auth] Retrying original request with new token')
            result = await retryRequest(args, api, newToken)
        } catch (error) {
            console.log('[Auth] Failed to retry request after refresh')
            return result
        }
    }

    return result
}

export const baseApi = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Event', 'Profile', 'EventPost', 'Category'],
    endpoints: () => ({}),
})
