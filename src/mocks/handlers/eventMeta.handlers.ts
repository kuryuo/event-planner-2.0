import { http, HttpResponse } from "msw";
import type { EventRole, ParticipantRoleKind } from "@/types/api/Event";
import { API_BASE_URL } from "../config";
import { copyMockEventRecord, patchMockEventRecord } from "../db/event.db";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

interface EventPhoto {
  id: string;
  filePath: string;
}

interface CancellationBody {
  isCancelled: boolean;
}

interface LifecycleBody {
  lifecycleState:
    | "Draft"
    | "Published"
    | "Completed"
    | "Cancelled"
    | "Archived";
}

interface AssignRoleBody {
  participantRole: ParticipantRoleKind;
}

const eventAssetUrl = (): string =>
  `${window.location.origin}/mock-assets/event.svg`;

let nextPhotoId = 2;
let nextRoleId = 2;

const photosByEvent = new Map<string, EventPhoto[]>([
  [
    "mock-event-1",
    [
      {
        id: "mock-photo-1",
        filePath: eventAssetUrl(),
      },
    ],
  ],
]);

const eventRoles: EventRole[] = [
  {
    id: "mock-role-1",
    name: "Organizer",
    eventId: "mock-event-1",
  },
];

const subscribers = [
  {
    id: "mock-user-2",
    email: "user@example.com",
    name: "Peter Petrov",
    phoneNumber: "+7 999 000-00-01",
    telegram: "@petrov",
    city: "Moscow",
    avatarUrl: null,
    role: "Observer",
  },
];

export const eventMetaHandlers = [
  http.get(`${API_BASE_URL}/api/events/:eventId/subscribers`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const count = Number(url.searchParams.get("count") ?? 10);
    const name = url.searchParams.get("name")?.toLowerCase();

    const filteredSubscribers = subscribers.filter(
      (subscriber) => !name || subscriber.name.toLowerCase().includes(name)
    );

    return HttpResponse.json({
      res: {
        users: filteredSubscribers.slice(offset, offset + count),
        totalCount: filteredSubscribers.length,
      },
    });
  }),

  http.post(`${API_BASE_URL}/api/events/:eventId/subscribe`, ({ request }) => {
    const authError = requireMockAuth({ request });

    return authError ?? new HttpResponse(null, { status: 204 });
  }),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/unsubscribe`,
    ({ request }) => {
      const authError = requireMockAuth({ request });

      return authError ?? new HttpResponse(null, { status: 204 });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/photos`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const eventPhotos = photosByEvent.get(String(params.eventId)) ?? [];
      const count = Number(url.searchParams.get("count") ?? eventPhotos.length);

      return HttpResponse.json({
        result: eventPhotos.slice(offset, offset + count),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/photos`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return HttpResponse.json(
          { message: mockT("eventMeta.fileRequired", request) },
          { status: 400 }
        );
      }

      const eventId = String(params.eventId);
      const photo: EventPhoto = {
        id: `mock-photo-${nextPhotoId++}`,
        filePath: eventAssetUrl(),
      };

      photosByEvent.set(eventId, [
        ...(photosByEvent.get(eventId) ?? []),
        photo,
      ]);

      return HttpResponse.json({ path: photo.filePath }, { status: 201 });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/photos/:photoId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const eventId = String(params.eventId);
      const photoId = String(params.photoId);

      photosByEvent.set(
        eventId,
        (photosByEvent.get(eventId) ?? []).filter(({ id }) => id !== photoId)
      );

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/avatar`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const formData = await request.formData();
      const avatar = formData.get("avatar");

      if (!avatar || typeof avatar === "string") {
        return HttpResponse.json(
          { message: mockT("eventMeta.avatarRequired", request) },
          { status: 400 }
        );
      }

      const event = patchMockEventRecord({
        eventId: String(params.eventId),
        patch: { avatar: eventAssetUrl() },
      });

      if (!event) {
        return HttpResponse.json(
          { message: mockT("event.errorNotFound", request) },
          { status: 404 }
        );
      }

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/roles`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const eventId = String(params.eventId);
      const url = new URL(request.url);
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const count = Number(url.searchParams.get("count") ?? 10);
      const roles = eventRoles.filter((role) => role.eventId === eventId);

      return HttpResponse.json({
        res: roles.slice(offset, offset + count),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/roles`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const roleName = url.searchParams.get("roleName");

      if (!roleName) {
        return HttpResponse.json(
          { message: mockT("eventMeta.roleNameRequired", request) },
          { status: 400 }
        );
      }

      eventRoles.push({
        id: `mock-role-${nextRoleId++}`,
        name: roleName,
        eventId: String(params.eventId),
      });

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/users/:userId/roles`,
    async ({ request }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      (await request.json()) as AssignRoleBody;

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.patch(
    `${API_BASE_URL}/api/events/:eventId/cancellation`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as CancellationBody;
      const event = patchMockEventRecord({
        eventId: String(params.eventId),
        patch: { isCancelled: body.isCancelled },
      });

      return event
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json(
            { message: mockT("event.errorNotFound", request) },
            { status: 404 }
          );
    }
  ),

  http.patch(
    `${API_BASE_URL}/api/events/:eventId/lifecycle-state`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as LifecycleBody;
      const event = patchMockEventRecord({
        eventId: String(params.eventId),
        patch: {
          lifecycleState: body.lifecycleState,
          status: body.lifecycleState,
        },
      });

      return event
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json(
            { message: mockT("event.errorNotFound", request) },
            { status: 404 }
          );
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/copy-template`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const name = url.searchParams.get("name");

      if (!name) {
        return HttpResponse.json(
          { message: mockT("eventMeta.templateNameRequired", request) },
          { status: 400 }
        );
      }

      const event = copyMockEventRecord({
        eventId: String(params.eventId),
        name,
      });

      return event
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json(
            { message: mockT("event.errorNotFound", request) },
            { status: 404 }
          );
    }
  ),
];
