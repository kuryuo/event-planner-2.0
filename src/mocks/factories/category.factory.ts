import type { Category } from "@/types/api/Category";

interface CreateMockCategoryParams {
  overrides?: Partial<Category>;
}

export const createMockCategory = ({
  overrides = {},
}: CreateMockCategoryParams = {}): Category => ({
  id: "mock-category-1",
  name: "Development",
  eventCategories: [],
  ...overrides,
});
