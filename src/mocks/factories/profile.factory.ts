import type { UserProfile } from "@/types/api/Profile";
import { getMockLanguage, mockT } from "../utils/mockI18n";

interface CreateMockProfileParams {
  overrides?: Partial<UserProfile>;
  request?: Request;
}

export const createMockProfile = ({
  overrides = {},
  request,
}: CreateMockProfileParams = {}): UserProfile => ({
  ...(getMockLanguage(request) === "ru"
    ? {
        firstName: "Иван",
        lastName: "Иванов",
        middleName: "Иванович",
      }
    : {
        firstName: "Ivan",
        lastName: "Ivanov",
        middleName: "Ivanovich",
      }),
  id: "mock-user-1",
  email: "demo@example.com",
  profession: mockT("profile.profession", request),
  phoneNumber: "+7 999 123-45-67",
  telegram: "@demo_user",
  city: mockT("profile.city", request),
  avatarUrl: null,
  backgroundUrl: null,
  userPrivilege: "ORGANIZER",
  ...overrides,
});
