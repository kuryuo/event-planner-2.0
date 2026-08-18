import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../config";
import { authHandlers } from "./auth.handlers";
import { profileHandlers } from "./profile.handlers";
import { categoryHandlers } from "./category.handlers";
import { userHandlers } from "./user.handlers";
import { eventHandlers } from "./event.handlers";
import { eventMetaHandlers } from "./eventMeta.handlers";
import { boardHandlers } from "./board.handlers";
import { collaborationHandlers } from "./collaboration.handlers";
import { attachmentHandlers } from "./attachment.handlers";
import { eventPostHandlers } from "./eventPost.handlers";
import { chatHandlers } from "./chat.handlers";
import { notificationHandlers } from "./notification.handlers";

export const handlers = [
  ...authHandlers,
  ...profileHandlers,
  ...categoryHandlers,
  ...userHandlers,
  ...eventHandlers,
  ...eventMetaHandlers,
  ...boardHandlers,
  ...collaborationHandlers,
  ...attachmentHandlers,
  ...eventPostHandlers,
  ...chatHandlers,
  ...notificationHandlers,

  http.get(`${API_BASE_URL}/api/mock/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.all(`${API_BASE_URL}/api/*`, ({ request }) => {
    const url = new URL(request.url);

    console.error(
      `[MSW] Unhandled handler: ${request.method} ${url.pathname}`
    );

    return HttpResponse.json(
      {
        message:
          `Mock handler not implemented: ` + `${request.method} ${url.pathname}`,
      },
      { status: 501 }
    );
  }),
];
