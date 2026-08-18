import type { Category } from "@/types/api/Category";
import { mockT } from "../utils/mockI18n";

interface CreateMockCategoryParams {
  overrides?: Partial<Category>;
  request?: Request;
}

export const createMockCategory = ({
  overrides = {},
  request,
}: CreateMockCategoryParams = {}): Category => ({
  id: "mock-category-1",
  name: mockT("category.development", request),
  eventCategories: [],
  ...overrides,
});
