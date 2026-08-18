import type { AuthTokens } from "@/types/api/Auth";

interface CreateMockAuthTokensParams {
  isAccessTokenExpired?: boolean;
}

export const MOCK_ACCESS_TOKEN = "mock-access-token";
export const MOCK_EXPIRED_ACCESS_TOKEN = "mock-expired-access-token";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token";

export const createMockAuthTokens = ({
  isAccessTokenExpired = false,
}: CreateMockAuthTokensParams = {}): AuthTokens => ({
  accessToken: isAccessTokenExpired
    ? MOCK_EXPIRED_ACCESS_TOKEN
    : MOCK_ACCESS_TOKEN,
  refreshToken: MOCK_REFRESH_TOKEN,
  refreshExpiresAt: "2099-12-31T23:59:59.000Z",
});
