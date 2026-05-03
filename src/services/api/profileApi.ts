import {baseApi} from "@/services/api/baseApi.ts";
import type {UpdateUserAvatarPayload, UpdateUserProfilePayload, UserEvent, UserProfile} from "@/types/api/Profile.ts";
import {normalizeEventTypes} from '@/utils/eventTypeLabels.ts';


export const profileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Получить профиль текущего пользователя
         */
        getProfile: builder.query<UserProfile, void>({
            query: () => ({
                url: 'users/me',
                method: 'GET',
            }),
            providesTags: ['Profile'],
        }),
        /**
         * Обновить профиль пользователя
         */
        updateProfile: builder.mutation<UserProfile, UpdateUserProfilePayload>({
            query: (body) => ({
                url: 'users/me',
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Profile'],
        }),
        /**
         * Загрузить новый аватар пользователя
         */
        updateProfileAvatar: builder.mutation<UserProfile, UpdateUserAvatarPayload>({
            query: ({file}) => {
                const formData = new FormData();
                formData.append('file', file);

                return {
                    url: 'users/me/avatar',
                    method: 'POST',
                    body: formData
                };
            },
            invalidatesTags: ['Profile'],
        }),
        /**
         * Получить список мероприятий, на которые подписан пользователь
         */
        getProfileEvents: builder.query<UserEvent[], void>({
            query: () => ({
                url: 'users/me/events',
                method: 'GET',
            }),
            transformResponse: (response: unknown): UserEvent[] => {
                const events = Array.isArray(response)
                    ? response
                    : Array.isArray((response as { result?: UserEvent[] })?.result)
                        ? (response as { result: UserEvent[] }).result
                        : [];

                return events.map((event) => ({
                    ...event,
                    types: normalizeEventTypes(event.types),
                }));
            },
            providesTags: ['Profile'],
        }),
    })
})

export const {
    useGetProfileQuery,
    useGetProfileEventsQuery,
    useUpdateProfileMutation,
    useUpdateProfileAvatarMutation
} = profileApi;