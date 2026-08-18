import type {
  AdminUser,
  Organizer,
  UserForeignProfile,
} from "@/types/api/User";

interface CreateMockUserParams {
  overrides?: Partial<UserForeignProfile>;
}

interface CreateMockOrganizerParams {
  overrides?: Partial<Organizer>;
}

interface CreateMockAdminUserParams {
  overrides?: Partial<AdminUser>;
}

export const createMockUser = ({
  overrides = {},
}: CreateMockUserParams = {}): UserForeignProfile => ({
  id: "mock-user-2",
  email: "user@example.com",
  passwordHash: null,
  lastName: "Petrov",
  firstName: "Peter",
  middleName: "Petrovich",
  profession: "Frontend developer",
  phoneNumber: "+7 999 000-00-01",
  telegram: "@petrov",
  city: "Moscow",
  resetToken: null,
  avatarUrl: null,
  backgroundUrl: null,
  userPrivilege: 0,
  ...overrides,
});

export const createMockOrganizer = ({
  overrides = {},
}: CreateMockOrganizerParams = {}): Organizer => ({
  id: "mock-organizer-1",
  email: "organizer@example.com",
  passwordHash: null,
  lastName: "Sidorova",
  firstName: "Anna",
  middleName: "Sergeevna",
  profession: "Event organizer",
  phoneNumber: "+7 999 000-00-02",
  telegram: "@sidorova",
  city: "Saint Petersburg",
  resetToken: null,
  avatarUrl: null,
  backgroundUrl: null,
  userPrivilege: 2,
  ...overrides,
});

export const createMockAdminUser = ({
  overrides = {},
}: CreateMockAdminUserParams = {}): AdminUser => ({
  id: "mock-admin-1",
  lastName: "Admin",
  firstName: "Alexey",
  middleName: "Igorevich",
  profession: "Administrator",
  phoneNumber: "+7 999 000-00-03",
  telegram: "@admin",
  city: "Moscow",
  avatarUrl: null,
  userPrivilege: "ADMIN",
  ...overrides,
});
