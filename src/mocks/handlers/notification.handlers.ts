import { http, HttpResponse } from "msw";
import type {
  InvitationItem,
  NotificationItem,
} from "@/types/api/Notification";
import { API_BASE_URL } from "../config";
import { requireMockAuth } from "../utils/requireMockAuth";

let notifications: NotificationItem[] = [
  {
    id: "mock-notification-1",
    title: "New message",
    text: "Peter Petrov sent a message",
    isRead: false,
    createdAt: "2026-08-18T08:30:00.000Z",
    eventId: "mock-event-1",
    type: "ChatMessage",
    senderName: "Peter Petrov",
    communityName: "Frontend Meetup",
    messageText: "Hi! When does the registration start?",
  },
  {
    id: "mock-notification-2",
    title: "Task assigned",
    text: "You were assigned the task \"Prepare the agenda\"",
    isRead: false,
    createdAt: "2026-08-17T12:00:00.000Z",
    eventId: "mock-event-1",
    type: "TaskAssigned",
  },
  {
    id: "mock-notification-3",
    title: "Event invitation",
    text: "You have been invited to Hackathon 2026",
    isRead: true,
    createdAt: "2026-08-16T10:00:00.000Z",
    invitationId: "mock-invitation-1",
    eventId: "mock-event-2",
    type: "Invitation",
  },
];

let invitations: InvitationItem[] = [
  {
    id: "mock-invitation-1",
    eventId: "mock-event-2",
    eventName: "Hackathon 2026",
    invitedByName: "Anna Sidorova",
    status: "Pending",
    createdAt: "2026-08-16T10:00:00.000Z",
  },
];

export const notificationHandlers = [
  http.get(`${API_BASE_URL}/api/notifications`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const count = Number(url.searchParams.get("count") ?? notifications.length);

    return HttpResponse.json({
      result: notifications.slice(offset, offset + count),
    });
  }),

  http.post(`${API_BASE_URL}/api/notifications/read`, async ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const notificationIds = (await request.json()) as string[];
    const selectedIds = new Set(notificationIds);

    notifications = notifications.map((notification) =>
      selectedIds.has(notification.id)
        ? { ...notification, isRead: true }
        : notification
    );

    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE_URL}/api/notifications/read-all`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    notifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE_URL}/api/invitations`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    return HttpResponse.json({ result: invitations });
  }),

  http.post(
    `${API_BASE_URL}/api/invitations/:invitationId/respond`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const invitationId = String(params.invitationId);
      const invitation = invitations.find(({ id }) => id === invitationId);

      if (!invitation) {
        return HttpResponse.json(
          { message: "Invitation not found" },
          { status: 404 }
        );
      }

      const url = new URL(request.url);
      const isAccepted = url.searchParams.get("accept") === "true";

      invitations = invitations.map((item) =>
        item.id === invitationId
          ? {
              ...item,
              status: isAccepted ? "Accepted" : "Declined",
            }
          : item
      );

      notifications = notifications.filter(
        ({ invitationId: relatedInvitationId }) =>
          relatedInvitationId !== invitationId
      );

      return new HttpResponse(null, { status: 204 });
    }
  ),
];
