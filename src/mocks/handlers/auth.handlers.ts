import { http, HttpResponse } from "msw";
import type {
  AuthResponse,
  LoginPayload,
  RecoverPayload,
  RefreshPayload,
  RegisterPayload,
} from "@/types/api/Auth";
import { API_BASE_URL } from "../config";
import {
  createMockAuthTokens,
  MOCK_REFRESH_TOKEN,
} from "../factories/auth.factory";
import { mockT } from "../utils/mockI18n";

const MOCK_EMAIL = "demo@example.com";
const MOCK_PASSWORD = "demo123";

const createAuthResponse = (): AuthResponse => ({
  data: createMockAuthTokens(),
});

export const authHandlers = [
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const credentials = (await request.json()) as LoginPayload;

    if (
      credentials.email !== MOCK_EMAIL ||
      credentials.password !== MOCK_PASSWORD
    ) {
      return HttpResponse.json(
        { message: mockT("auth.invalidCredentials", request) },
        { status: 401 }
      );
    }

    return HttpResponse.json(createAuthResponse());
  }),

  http.post(`${API_BASE_URL}/api/auth/register`, async ({ request }) => {
    const payload = (await request.json()) as RegisterPayload;

    if (!payload.email || !payload.password) {
      return HttpResponse.json(
        { message: mockT("auth.emailPasswordRequired", request) },
        { status: 400 }
      );
    }

    return HttpResponse.json(createAuthResponse(), { status: 201 });
  }),

  http.post(`${API_BASE_URL}/api/auth/refresh`, async ({ request }) => {
    const payload = (await request.json()) as RefreshPayload;

    if (payload.refreshToken !== MOCK_REFRESH_TOKEN) {
      return HttpResponse.json(
        { message: mockT("auth.invalidRefreshToken", request) },
        { status: 401 }
      );
    }

    return HttpResponse.json(createAuthResponse());
  }),

  http.post(
    `${API_BASE_URL}/api/auth/recover-password`,
    async ({ request }) => {
      const payload = (await request.json()) as RecoverPayload;

      if (!payload.email) {
        return HttpResponse.json(
          { message: mockT("auth.emailRequired", request) },
          { status: 400 }
        );
      }

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
