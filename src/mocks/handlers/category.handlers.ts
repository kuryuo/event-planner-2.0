import { http, HttpResponse } from "msw";
import type { CategoriesResponse } from "@/types/api/Category";
import { API_BASE_URL } from "../config";
import { createMockCategory } from "../factories/category.factory";
import { requireMockAuth } from "../utils/requireMockAuth";

export const categoryHandlers = [
  http.get(`${API_BASE_URL}/api/categories`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const response: CategoriesResponse = {
      result: [
        createMockCategory(),
        createMockCategory({
          overrides: {
            id: "mock-category-2",
            name: "Education",
          },
        }),
        createMockCategory({
          overrides: {
            id: "mock-category-3",
            name: "Career",
          },
        }),
      ],
    };

    return HttpResponse.json(response);
  }),
];
