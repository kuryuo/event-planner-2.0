import type { UserEvent } from "@/types/api/Profile";
import { mockT } from "../utils/mockI18n";

interface CreateMockProfileEventParams {
  overrides?: Partial<UserEvent>;
  request?: Request;
}

export const createMockProfileEvent = ({
  overrides = {},
  request,
}: CreateMockProfileEventParams = {}): UserEvent => ({
  id: "mock-event-1",
  name: mockT("profile.eventName", request),
  description: mockT("profile.eventDescription", request),
  startDate: "2026-09-10T10:00:00.000Z",
  endDate: "2026-09-10T18:00:00.000Z",
  location: mockT("profile.eventLocation", request),
  format: "offline",
  eventType: "open",
  types: ["Lecture"],
  responsiblePersonId: "mock-user-1",
  maxParticipants: 100,
  color: "#1677ff",
  categories: [mockT("profile.categoryDevelopment", request)],
  previewPhotos: [],
  status: "Published",
  ...overrides,
});
