import {baseApi} from "@/services/api/baseApi.ts";
import type {AdminUser, UserForeignProfile, Organizer} from "@/types/api/User.ts";
import type {UserEvent} from "@/types/api/Profile.ts";
import {normalizeEventTypes} from '@/utils/eventTypeLabels.ts';

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
        }),
        /**
         * Получить всех пользователей обладающих привилегией на создание мероприятий
         */
        getOrganizers: builder.query<Organizer[], void>({
            query: () => ({
                url: 'users/organizers',
                method: 'GET',
            }),
            transformResponse: (response: unknown): Organizer[] => {
                if (Array.isArray(response)) return response;
                if (Array.isArray((response as { result?: Organizer[] })?.result)) {
                    return (response as { result: Organizer[] }).result;
                }
                return [];
            },
        }),
        /**
         * Получить список пользователей (admin)
         */
        getAdminUsers: builder.query<
            AdminUser[],
            {
                firstName?: string;
                lastName?: string;
                profession?: string;
                city?: string;
                count?: number;
                offset?: number;
            }
        >({
            query: ({firstName, lastName, profession, city, count = 200, offset = 0} = {}) => ({
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
            transformResponse: (response: unknown): AdminUser[] => {
                if (Array.isArray(response)) return response;
                if (Array.isArray((response as { result?: AdminUser[] })?.result)) {
                    return (response as { result: AdminUser[] }).result;
                }
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

