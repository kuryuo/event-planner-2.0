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
        /**
         * Получить список пользователей (admin)
         */
        getAdminUsers: builder.query<
            Organizer[],
            {
                firstName?: string;
                lastName?: string;
                profession?: string;
                city?: string;
                count?: number;
                offset?: number;
            }
        >({
            query: ({firstName, lastName, profession, city, count = 20, offset = 0} = {}) => ({
                url: 'admin/users',
                method: 'GET',
                params: {
                    ...(firstName ? {FirstName: firstName} : {}),
                    ...(lastName ? {LastName: lastName} : {}),
                    ...(profession ? {Profession: profession} : {}),
                    ...(city ? {City: city} : {}),
                    Count: count,
                    Offset: offset,
                },
            }),
            transformResponse: (response: any) => {
                if (Array.isArray(response)) return response;
                if (Array.isArray(response?.result)) return response.result;
                return [];
            },
        }),
    })
})

export const {
    useGetUserProfileQuery,
    useGetUserEventsQuery,
    useGetOrganizersQuery,
    useGetAdminUsersQuery,
} = userApi;

