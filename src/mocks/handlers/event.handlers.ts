import { http, HttpResponse } from "msw";
import type {
  CreateEventPayload,
  EventResponse,
  UpdateEventPayload,
} from "@/types/api/Event";
import { API_BASE_URL } from "../config";
import {
  createMockEventRecord,
  deleteMockEventRecord,
  getMockEventById,
  getMockEvents,
  updateMockEventRecord,
} from "../db/event.db";
import { requireMockAuth } from "../utils/requireMockAuth";

const filterEvents = ({
  events,
  request,
}: {
  events: EventResponse[];
  request: Request;
}): EventResponse[] => {
  const url = new URL(request.url);
  const name = url.searchParams.get("Name")?.toLowerCase();
  const venueFormat = url.searchParams.get("VenueFormat");
  const offset = Number(url.searchParams.get("Offset") ?? 0);
  const count = Number(url.searchParams.get("Count") ?? events.length);

  return events
    .filter((event) => !name || event.name.toLowerCase().includes(name))
    .filter((event) => !venueFormat || event.venueFormat === venueFormat)
    .slice(offset, offset + count);
};

export const eventHandlers = [
  http.get(`${API_BASE_URL}/api/events/myevents`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const events = getMockEvents().filter(
      ({ lifecycleState }) => lifecycleState !== "Archived"
    );

    return HttpResponse.json({ result: events });
  }),

  http.get(`${API_BASE_URL}/api/events/archive`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const events = getMockEvents().filter(
      ({ lifecycleState }) => lifecycleState === "Archived"
    );

    return HttpResponse.json({
      result: filterEvents({ events, request }),
    });
  }),

  http.get(`${API_BASE_URL}/api/events`, ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const events = getMockEvents().filter(
      ({ lifecycleState }) => lifecycleState !== "Archived"
    );

    return HttpResponse.json({
      result: filterEvents({ events, request }),
    });
  }),

  http.post(`${API_BASE_URL}/api/events`, async ({ request }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as CreateEventPayload;
    const event = createMockEventRecord({ payload });

    return HttpResponse.json({ result: event }, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/api/events/:eventId`, ({ request, params }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const event = getMockEventById({
      eventId: String(params.eventId),
    });

    if (!event) {
      return HttpResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ result: event });
  }),

  http.put(
    `${API_BASE_URL}/api/events/:eventId`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const payload = (await request.json()) as UpdateEventPayload;
      const event = updateMockEventRecord({
        eventId: String(params.eventId),
        payload,
      });

      if (!event) {
        return HttpResponse.json(
          { message: "Event not found" },
          { status: 404 }
        );
      }

      return HttpResponse.json({ result: event });
    }
  ),

  http.delete(`${API_BASE_URL}/api/events/:eventId`, ({ request, params }) => {
    const authError = requireMockAuth({ request });

    if (authError) {
      return authError;
    }

    const isDeleted = deleteMockEventRecord({
      eventId: String(params.eventId),
    });

    if (!isDeleted) {
      return HttpResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
