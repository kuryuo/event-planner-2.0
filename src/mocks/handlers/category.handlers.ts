import { http, HttpResponse } from "msw";
import type { CategoriesResponse } from "@/types/api/Category";
import { API_BASE_URL } from "../config";
import { createMockCategory } from "../factories/category.factory";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

export const categoryHandlers = [
  http.get(`${API_BASE_URL}/api/categories`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const response: CategoriesResponse = {
      result: [
        createMockCategory({ request }),
        createMockCategory({
          request,
          overrides: {
            id: "mock-category-2",
            name: mockT("category.education", request),
          },
        }),
        createMockCategory({
          request,
          overrides: {
            id: "mock-category-3",
            name: mockT("category.career", request),
          },
        }),
      ],
    };

    return HttpResponse.json(response);
  }),
];
