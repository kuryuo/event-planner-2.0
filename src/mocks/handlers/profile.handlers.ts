import { http, HttpResponse } from "msw";
import type { UpdateUserProfilePayload } from "@/types/api/Profile";
import { API_BASE_URL } from "../config";
import {
  getMockProfile,
  getMockProfileEvents,
  updateMockProfile,
  updateMockProfileAvatar,
} from "../db/profile.db";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

export const profileHandlers = [
  http.get(`${API_BASE_URL}/api/users/me`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    return HttpResponse.json(getMockProfile(request));
  }),

  http.put(`${API_BASE_URL}/api/users/me`, async ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as UpdateUserProfilePayload;

    return HttpResponse.json(updateMockProfile({ payload }));
  }),

  http.post(`${API_BASE_URL}/api/users/me/avatar`, async ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return HttpResponse.json(
        { message: mockT("profile.avatarRequired", request) },
        { status: 400 }
      );
    }

    const avatarUrl = `${window.location.origin}/mock-assets/avatar.svg`;

    return HttpResponse.json(updateMockProfileAvatar({ avatarUrl }));
  }),

  http.get(`${API_BASE_URL}/api/users/me/events`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    return HttpResponse.json({
      result: getMockProfileEvents(request),
    });
  }),
];
