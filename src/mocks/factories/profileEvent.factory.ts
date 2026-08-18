import type { UserEvent } from "@/types/api/Profile";

interface CreateMockProfileEventParams {
  overrides?: Partial<UserEvent>;
}

export const createMockProfileEvent = ({
  overrides = {},
}: CreateMockProfileEventParams = {}): UserEvent => ({
  id: "mock-event-1",
  name: "Frontend Meetup",
  description: "Frontend developers meetup",
  startDate: "2026-09-10T10:00:00.000Z",
  endDate: "2026-09-10T18:00:00.000Z",
  location: "Moscow",
  format: "offline",
  eventType: "open",
  types: ["Lecture"],
  responsiblePersonId: "mock-user-1",
  maxParticipants: 100,
  color: "#1677ff",
  categories: ["Development"],
  previewPhotos: [],
  status: "Published",
  ...overrides,
});
