import { http, HttpResponse } from "msw";
import type { EventAttachment } from "@/types/api/Event";
import { API_BASE_URL } from "../config";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

interface LinkBody {
  title?: string;
  url: string;
}

let nextAttachmentId = 3;

const attachmentsByEvent = new Map<string, EventAttachment[]>([
  [
    "mock-event-1",
    [
      {
        id: "mock-attachment-1",
        eventId: "mock-event-1",
        authorId: "mock-user-1",
        kind: "File",
        title: "Event program",
        originalFileName: "program.txt",
        fileName: "program.txt",
        contentType: "text/plain",
        size: 128,
        fileExtension: "txt",
        authorDisplayName: "Ivan Ivanov",
        authorAvatarUrl: null,
        createdAt: "2026-08-15T10:00:00.000Z",
      },
      {
        id: "mock-attachment-2",
        eventId: "mock-event-1",
        authorId: "mock-user-1",
        kind: "Link",
        title: "Event website",
        resource: "https://example.com",
        url: "https://example.com",
        linkSiteKey: "example.com",
        authorDisplayName: "Ivan Ivanov",
        authorAvatarUrl: null,
        createdAt: "2026-08-16T10:00:00.000Z",
      },
    ],
  ],
]);

const getAttachments = ({
  eventId,
}: {
  eventId: string;
}): EventAttachment[] => {
  if (!attachmentsByEvent.has(eventId)) {
    attachmentsByEvent.set(eventId, []);
  }

  return attachmentsByEvent.get(eventId)!;
};

export const attachmentHandlers = [
  http.get(
    `${API_BASE_URL}/api/events/:eventId/attachments/facets`,
    ({ request }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      return HttpResponse.json({
        result: {
          fileExtensions: [
            { extension: "txt", label: "TXT" },
            { extension: "pdf", label: "PDF" },
          ],
          linkSites: [{ siteKey: "example.com", label: "example.com" }],
          authors: [
            {
              id: "mock-user-1",
              displayName: mockT("chat.userIvan", request),
              avatarUrl: null,
            },
          ],
        },
      });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/attachments`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const query = url.searchParams.get("q")?.toLowerCase();
      const kinds = url.searchParams.get("kinds")?.split(",");
      const sort = url.searchParams.get("sort");
      let attachments = [
        ...getAttachments({
          eventId: String(params.eventId),
        }),
      ];

      attachments = attachments.filter((attachment) => {
        const matchesQuery =
          !query ||
          attachment.title?.toLowerCase().includes(query) ||
          attachment.originalFileName?.toLowerCase().includes(query);

        const matchesKind =
          !kinds?.length || kinds.includes(String(attachment.kind));

        return Boolean(matchesQuery && matchesKind);
      });

      attachments.sort((first, second) => {
        if (sort === "Oldest") {
          return String(first.createdAt).localeCompare(
            String(second.createdAt)
          );
        }

        if (sort === "TitleAsc") {
          return String(first.title).localeCompare(String(second.title));
        }

        return String(second.createdAt).localeCompare(String(first.createdAt));
      });

      return HttpResponse.json({
        result: attachments.map((attachment) => ({
          ...attachment,
          title:
            attachment.title === "Event program"
              ? mockT("attachment.eventProgram", request)
              : attachment.title === "Event website"
                ? mockT("attachment.eventWebsite", request)
                : attachment.title,
          authorDisplayName:
            attachment.authorDisplayName === "Ivan Ivanov"
              ? mockT("chat.userIvan", request)
              : attachment.authorDisplayName,
        })),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/attachments/file`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return HttpResponse.json(
          { message: mockT("attachment.fileRequired", request) },
          { status: 400 }
        );
      }

      const eventId = String(params.eventId);
      const attachmentId = `mock-attachment-${nextAttachmentId++}`;
      const fileExtension = file.name.split(".").pop() ?? null;
      const attachment: EventAttachment = {
        id: attachmentId,
        eventId,
        authorId: "mock-user-1",
        kind: "File",
        title: file.name,
        originalFileName: file.name,
        fileName: file.name,
        resource:
          `${API_BASE_URL}/api/events/${eventId}` +
          `/attachments/${attachmentId}/download`,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        fileExtension,
        authorDisplayName: mockT("chat.userIvan", request),
        authorAvatarUrl: null,
        createdAt: new Date().toISOString(),
      };

      getAttachments({ eventId }).push(attachment);

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/attachments/link`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as LinkBody;

      if (!body.url) {
        return HttpResponse.json(
          { message: mockT("attachment.urlRequired", request) },
          { status: 400 }
        );
      }

      const eventId = String(params.eventId);
      const hostname = new URL(body.url).hostname;
      const attachment: EventAttachment = {
        id: `mock-attachment-${nextAttachmentId++}`,
        eventId,
        authorId: "mock-user-1",
        kind: "Link",
        title: body.title || hostname,
        resource: body.url,
        url: body.url,
        linkSiteKey: hostname,
        authorDisplayName: mockT("chat.userIvan", request),
        authorAvatarUrl: null,
        createdAt: new Date().toISOString(),
      };

      getAttachments({ eventId }).push(attachment);

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/attachments/:attachmentId/download`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const attachment = getAttachments({
        eventId: String(params.eventId),
      }).find(({ id }) => id === params.attachmentId);

      if (!attachment || attachment.kind !== "File") {
        return HttpResponse.json(
          { message: mockT("attachment.fileNotFound", request) },
          { status: 404 }
        );
      }

      const blob = new Blob(["Test attachment content - Event Planner"], {
        type: attachment.contentType ?? "text/plain",
      });

      return new HttpResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": attachment.contentType ?? "text/plain",
          "Content-Disposition": `attachment; filename="${attachment.originalFileName}"`,
        },
      });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/attachments/:attachmentId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const eventId = String(params.eventId);
      const attachments = getAttachments({ eventId });
      const filteredAttachments = attachments.filter(
        ({ id }) => id !== params.attachmentId
      );

      if (filteredAttachments.length === attachments.length) {
        return HttpResponse.json(
          { message: mockT("attachment.notFound", request) },
          { status: 404 }
        );
      }

      attachmentsByEvent.set(eventId, filteredAttachments);

      return new HttpResponse(null, { status: 204 });
    }
  ),
];
