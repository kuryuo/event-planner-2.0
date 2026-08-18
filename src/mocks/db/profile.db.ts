import type {
  UpdateUserProfilePayload,
  UserEvent,
  UserProfile,
} from "@/types/api/Profile";
import { createMockProfile } from "../factories/profile.factory";
import { createMockProfileEvent } from "../factories/profileEvent.factory";

interface UpdateMockProfileParams {
  payload: UpdateUserProfilePayload;
}

interface UpdateMockProfileAvatarParams {
  avatarUrl: string;
}

let mockProfile = createMockProfile();

const mockProfileEvents: UserEvent[] = [
  createMockProfileEvent(),
  createMockProfileEvent({
    overrides: {
      id: "mock-event-2",
      name: "Hackathon 2026",
      description: "Team software development projects",
      startDate: "2026-10-01T08:00:00.000Z",
      endDate: "2026-10-03T18:00:00.000Z",
      types: ["Hackathon"],
      color: "#52c41a",
    },
  }),
];

export const getMockProfile = (): UserProfile => ({
  ...mockProfile,
});

export const updateMockProfile = ({
  payload,
}: UpdateMockProfileParams): UserProfile => {
  mockProfile = {
    ...mockProfile,
    ...payload,
  };

  return getMockProfile();
};

export const updateMockProfileAvatar = ({
  avatarUrl,
}: UpdateMockProfileAvatarParams): UserProfile => {
  mockProfile = {
    ...mockProfile,
    avatarUrl,
  };

  return getMockProfile();
};

export const getMockProfileEvents = (): UserEvent[] =>
  mockProfileEvents.map((event) => ({ ...event }));
