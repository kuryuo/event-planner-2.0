import {baseApi} from "@/services/api/baseApi.ts";
import type {UserForeignProfile, Organizer} from "@/types/api/User.ts";
import type {UserEvent} from "@/types/api/Profile.ts";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Получить профиль пользователя по ID
         */
        getUserProfile: builder.query<UserForeignProfile, string>({
            query: (userId) => ({
                url: `users/${userId}`,
                method: 'GET',
            }),
        }),
        /**
         * Получить все мероприятия на которые подписан пользователь
         */
        getUserEvents: builder.query<UserEvent[], string>({
            query: (userId) => ({
                url: `users/${userId}/events`,
                method: 'GET',
            }),
        }),
        /**
         * Получить всех пользователей обладающих привилегией на создание мероприятий
         */
        getOrganizers: builder.query<Organizer[], void>({
            query: () => ({
                url: 'users/organizers',
                method: 'GET',
            }),
        }),
    })
})

export const {
    useGetUserProfileQuery,
    useGetUserEventsQuery,
    useGetOrganizersQuery,
} = userApi;

