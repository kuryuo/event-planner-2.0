import type {
  CreateEventPayload,
  EventResponse,
  UpdateEventPayload,
} from "@/types/api/Event";
import { createMockEvent } from "../factories/event.factory";

interface CreateMockEventRecordParams {
  payload: CreateEventPayload;
}

interface UpdateMockEventRecordParams {
  eventId: string;
  payload: UpdateEventPayload;
}

let nextEventId = 4;

let mockEvents: EventResponse[] = [
  createMockEvent(),
  createMockEvent({
    overrides: {
      id: "mock-event-2",
      name: "Hackathon 2026",
      description: "Team software development projects",
      startDate: "2026-10-01T08:00:00.000Z",
      endDate: "2026-10-03T18:00:00.000Z",
      location: "Saint Petersburg",
      types: ["Hackathon"],
      categories: ["Development", "Career"],
      color: "#52c41a",
    },
  }),
  createMockEvent({
    overrides: {
      id: "mock-event-3",
      name: "Archived lecture",
      startDate: "2026-05-01T10:00:00.000Z",
      endDate: "2026-05-01T12:00:00.000Z",
      lifecycleState: "Archived",
      status: "Archived",
      types: ["Lecture"],
      color: "#8c8c8c",
    },
  }),
];

export const getMockEvents = (): EventResponse[] =>
  mockEvents.map((event) => ({ ...event }));

export const getMockEventById = ({
  eventId,
}: {
  eventId: string;
}): EventResponse | undefined => {
  const event = mockEvents.find(({ id }) => id === eventId);

  return event ? { ...event } : undefined;
};

export const createMockEventRecord = ({
  payload,
}: CreateMockEventRecordParams): EventResponse => {
  const lifecycleState = payload.publish === false ? "Draft" : "Published";

  const event = createMockEvent({
    overrides: {
      ...payload,
      id: `mock-event-${nextEventId++}`,
      format: payload.venueFormat === "Online" ? "online" : "offline",
      eventType: "open",
      responsiblePersonId: payload.responsiblePersonId ?? "mock-user-1",
      maxParticipants: payload.maxParticipants ?? 0,
      color: payload.color ?? "#1677ff",
      categories: payload.categories ?? [],
      previewPhotos: [],
      status: lifecycleState,
      lifecycleState,
      avatar: null,
    },
  });

  mockEvents = [...mockEvents, event];

  return { ...event };
};

export const updateMockEventRecord = ({
  eventId,
  payload,
}: UpdateMockEventRecordParams): EventResponse | undefined => {
  const eventIndex = mockEvents.findIndex(({ id }) => id === eventId);

  if (eventIndex === -1) {
    return undefined;
  }

  const currentEvent = mockEvents[eventIndex];
  const updatedEvent: EventResponse = {
    ...currentEvent,
    ...payload,
    startDate: payload.startDate ?? currentEvent.startDate,
    endDate: payload.endDate ?? currentEvent.endDate,
    maxParticipants: payload.maxParticipants ?? currentEvent.maxParticipants,
    color: payload.color ?? currentEvent.color,
    avatar: currentEvent.avatar,
  };

  mockEvents = mockEvents.map((event, index) =>
    index === eventIndex ? updatedEvent : event
  );

  return { ...updatedEvent };
};

export const deleteMockEventRecord = ({
  eventId,
}: {
  eventId: string;
}): boolean => {
  const previousLength = mockEvents.length;

  mockEvents = mockEvents.filter(({ id }) => id !== eventId);

  return mockEvents.length < previousLength;
};

interface PatchMockEventRecordParams {
  eventId: string;
  patch: Partial<EventResponse>;
}

interface CopyMockEventRecordParams {
  eventId: string;
  name: string;
}

export const patchMockEventRecord = ({
  eventId,
  patch,
}: PatchMockEventRecordParams): EventResponse | undefined => {
  const currentEvent = mockEvents.find(({ id }) => id === eventId);

  if (!currentEvent) {
    return undefined;
  }

  const updatedEvent: EventResponse = {
    ...currentEvent,
    ...patch,
  };

  mockEvents = mockEvents.map((event) =>
    event.id === eventId ? updatedEvent : event
  );

  return { ...updatedEvent };
};

export const copyMockEventRecord = ({
  eventId,
  name,
}: CopyMockEventRecordParams): EventResponse | undefined => {
  const sourceEvent = mockEvents.find(({ id }) => id === eventId);

  if (!sourceEvent) {
    return undefined;
  }

  const copiedEvent: EventResponse = {
    ...sourceEvent,
    id: `mock-event-${nextEventId++}`,
    name,
    status: "Draft",
    lifecycleState: "Draft",
  };

  mockEvents = [...mockEvents, copiedEvent];

  return { ...copiedEvent };
};
