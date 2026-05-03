import {baseApi} from "@/services/api/baseApi.ts";
import type {CategoriesResponse} from "@/types/api/Category.ts";
import {normalizeCategoriesResponse} from '@/utils/categories.ts';

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Получить все возможные категории
         */
        getCategories: builder.query<CategoriesResponse, void>({
            query: () => ({
                url: 'categories',
                method: 'GET',
            }),
            transformResponse: (response: unknown): CategoriesResponse => ({
                result: normalizeCategoriesResponse(response),
            }),
            providesTags: ['Category'],
        }),
    })
})

export const {
    useGetCategoriesQuery,
} = categoryApi;

