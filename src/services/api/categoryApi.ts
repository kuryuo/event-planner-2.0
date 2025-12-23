import {baseApi} from "@/services/api/baseApi.ts";
import type {CategoriesResponse} from "@/types/api/Category.ts";

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
            providesTags: ['Category'],
        }),
    })
})

export const {
    useGetCategoriesQuery,
} = categoryApi;

