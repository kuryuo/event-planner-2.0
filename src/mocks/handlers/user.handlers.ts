import { http, HttpResponse } from "msw";
import type {
  AdminUser,
  Organizer,
  UserForeignProfile,
} from "@/types/api/User";
import { API_BASE_URL } from "../config";
import { getMockProfileEvents } from "../db/profile.db";
import {
  createMockAdminUser,
  createMockOrganizer,
  createMockUser,
} from "../factories/user.factory";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

const mockUsers: UserForeignProfile[] = [
  createMockUser(),
  createMockUser({
    overrides: {
      id: "mock-user-3",
      email: "designer@example.com",
      firstName: "Maria",
      lastName: "Smirnova",
      middleName: "Andreevna",
      profession: "UI/UX designer",
      city: "Kazan",
    },
  }),
];

const mockOrganizers: Organizer[] = [
  createMockOrganizer(),
  createMockOrganizer({
    overrides: {
      id: "mock-organizer-2",
      email: "ivanov@example.com",
      firstName: "Ivan",
      lastName: "Ivanov",
      middleName: "Ivanovich",
      city: "Moscow",
    },
  }),
];

const mockAdminUsers: AdminUser[] = [
  createMockAdminUser(),
  ...mockOrganizers,
  ...mockUsers,
];

const includesQuery = (
  value: string | null | undefined,
  query: string | null
): boolean => {
  if (!query) {
    return true;
  }

  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
};

export const userHandlers = [
  http.get(`${API_BASE_URL}/api/users/organizers`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    return HttpResponse.json({
      result: mockOrganizers.map((organizer) => ({
        ...organizer,
        firstName:
          organizer.firstName === "Ivan"
            ? mockT("user.ivan", request)
            : organizer.firstName,
        lastName:
          organizer.lastName === "Ivanov"
            ? mockT("user.ivanov", request)
            : organizer.lastName,
        middleName:
          organizer.middleName === "Ivanovich"
            ? mockT("user.ivanovich", request)
            : organizer.middleName,
        city:
          organizer.city === "Moscow"
            ? mockT("event.locationMoscow", request)
            : organizer.city,
      })),
    });
  }),

  http.get(`${API_BASE_URL}/api/admin/users`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const firstName = url.searchParams.get("FirstName");
    const lastName = url.searchParams.get("LastName");
    const profession = url.searchParams.get("Profession");
    const city = url.searchParams.get("City");
    const count = Number(url.searchParams.get("Count") ?? 200);
    const offset = Number(url.searchParams.get("Offset") ?? 0);

    const filteredUsers = mockAdminUsers.filter(
      (user) =>
        includesQuery(user.firstName, firstName) &&
        includesQuery(user.lastName, lastName) &&
        includesQuery(user.profession, profession) &&
        includesQuery(user.city, city)
    );

    return HttpResponse.json({
      result: filteredUsers.slice(offset, offset + count).map((user) => ({
        ...user,
        firstName:
          user.firstName === "Ivan"
            ? mockT("user.ivan", request)
            : user.firstName === "Maria"
              ? mockT("user.maria", request)
              : user.firstName,
        lastName:
          user.lastName === "Ivanov"
            ? mockT("user.ivanov", request)
            : user.lastName === "Smirnova"
              ? mockT("user.smirnova", request)
              : user.lastName,
        middleName:
          user.middleName === "Ivanovich"
            ? mockT("user.ivanovich", request)
            : user.middleName === "Andreevna"
              ? mockT("user.andreevna", request)
              : user.middleName,
        profession:
          user.profession === "UI/UX designer"
            ? mockT("user.professionUiUx", request)
            : user.profession,
        city:
          user.city === "Moscow"
            ? mockT("event.locationMoscow", request)
            : user.city === "Kazan"
              ? mockT("user.cityKazan", request)
              : user.city,
      })),
    });
  }),

  http.get(`${API_BASE_URL}/api/users/:userId/events`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    return HttpResponse.json({
      result: getMockProfileEvents(request),
    });
  }),

  http.get(`${API_BASE_URL}/api/users/:userId`, ({ request, params }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const user = [...mockUsers, ...mockOrganizers].find(
      ({ id }) => id === params.userId
    );

    if (!user) {
      return HttpResponse.json(
        { message: mockT("user.notFound", request) },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...user,
      firstName:
        user.firstName === "Ivan"
          ? mockT("user.ivan", request)
          : user.firstName === "Maria"
            ? mockT("user.maria", request)
            : user.firstName,
      lastName:
        user.lastName === "Ivanov"
          ? mockT("user.ivanov", request)
          : user.lastName === "Smirnova"
            ? mockT("user.smirnova", request)
            : user.lastName,
      middleName:
        user.middleName === "Ivanovich"
          ? mockT("user.ivanovich", request)
          : user.middleName === "Andreevna"
            ? mockT("user.andreevna", request)
            : user.middleName,
      profession:
        user.profession === "UI/UX designer"
          ? mockT("user.professionUiUx", request)
          : user.profession,
      city:
        user.city === "Moscow"
          ? mockT("event.locationMoscow", request)
          : user.city === "Kazan"
            ? mockT("user.cityKazan", request)
            : user.city,
    });
  }),
];
