import type { UserProfile } from "@/types/api/Profile";

interface CreateMockProfileParams {
  overrides?: Partial<UserProfile>;
}

export const createMockProfile = ({
  overrides = {},
}: CreateMockProfileParams = {}): UserProfile => ({
  id: "mock-user-1",
  firstName: "Ivan",
  lastName: "Ivanov",
  middleName: "Ivanovich",
  email: "demo@example.com",
  profession: "Event organizer",
  phoneNumber: "+7 999 123-45-67",
  telegram: "@demo_user",
  city: "Moscow",
  avatarUrl: null,
  backgroundUrl: null,
  userPrivilege: "ORGANIZER",
  ...overrides,
});
