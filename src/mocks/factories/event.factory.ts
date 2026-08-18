import type { EventResponse } from "@/types/api/Event";

interface CreateMockEventParams {
  overrides?: Partial<EventResponse>;
}

export const createMockEvent = ({
  overrides = {},
}: CreateMockEventParams = {}): EventResponse => ({
  id: "mock-event-1",
  name: "Frontend Meetup",
  description: "Frontend developers meetup",
  startDate: "2026-09-10T10:00:00.000Z",
  endDate: "2026-09-10T18:00:00.000Z",
  location: "Moscow",
  auditorium: "Main hall",
  format: "offline",
  venueFormat: "InPerson",
  eventType: "open",
  responsiblePersonId: "mock-user-1",
  maxParticipants: 100,
  categories: ["Development"],
  types: ["Lecture"],
  previewPhotos: [],
  status: "Published",
  lifecycleState: "Published",
  isCancelled: false,
  myParticipantRole: "Organizer",
  avatar: null,
  color: "#1677ff",
  ...overrides,
});
