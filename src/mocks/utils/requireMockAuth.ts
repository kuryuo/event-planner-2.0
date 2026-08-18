import { HttpResponse } from "msw";
import { MOCK_ACCESS_TOKEN } from "../factories/auth.factory";

interface RequireMockAuthParams {
  request: Request;
}

export const requireMockAuth = ({
  request,
}: RequireMockAuthParams): HttpResponse<{ message: string }> | null => {
  const authorization = request.headers.get("Authorization");

  if (authorization === `Bearer ${MOCK_ACCESS_TOKEN}`) {
    return null;
  }

  return HttpResponse.json(
    { message: "Authorization required" },
    { status: 401 }
  );
};
