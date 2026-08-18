import type {
  UpdateUserProfilePayload,
  UserEvent,
  UserProfile,
} from "@/types/api/Profile";
import { createMockProfile } from "../factories/profile.factory";
import { createMockProfileEvent } from "../factories/profileEvent.factory";
import { mockT } from "../utils/mockI18n";

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

export const getMockProfile = (request?: Request): UserProfile => {
  const localizedProfile = createMockProfile({ request });

  return {
    ...localizedProfile,
    ...mockProfile,
    firstName: mockProfile.firstName || localizedProfile.firstName,
    lastName: mockProfile.lastName || localizedProfile.lastName,
    middleName: mockProfile.middleName || localizedProfile.middleName,
    profession:
      mockProfile.profession === "Event organizer" ||
      mockProfile.profession === "Организатор мероприятий" ||
      !mockProfile.profession
        ? mockT("profile.profession", request)
        : mockProfile.profession,
    city:
      mockProfile.city === "Moscow" || mockProfile.city === "Москва" || !mockProfile.city
        ? mockT("profile.city", request)
        : mockProfile.city,
  } as UserProfile;
};

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

export const getMockProfileEvents = (request?: Request): UserEvent[] =>
  mockProfileEvents.map((event, index) => {
    if (index === 0) {
      return {
        ...createMockProfileEvent({ request }),
        ...event,
        name:
          event.name === "Frontend Meetup" || event.name === "Frontend митап"
            ? mockT("profile.eventName", request)
            : event.name,
        description:
          event.description === "Frontend developers meetup" ||
          event.description === "Встреча frontend-разработчиков"
            ? mockT("profile.eventDescription", request)
            : event.description,
        location:
          event.location === "Moscow" || event.location === "Москва"
            ? mockT("profile.eventLocation", request)
            : event.location,
        categories: event.categories?.map((category) =>
          category === "Development" || category === "Разработка"
            ? mockT("profile.categoryDevelopment", request)
            : category
        ) ?? [],
      };
    }

    return {
      ...event,
      name:
        event.name === "Hackathon 2026" || event.name === "Хакатон 2026"
          ? mockT("profile.eventHackathonName", request)
          : event.name,
      description:
        event.description === "Team software development projects" ||
        event.description === "Командная разработка программных проектов"
          ? mockT("profile.eventHackathonDescription", request)
          : event.description,
      categories: event.categories?.map((category) =>
        category === "Development" || category === "Разработка"
          ? mockT("profile.categoryDevelopment", request)
          : category
      ) ?? [],
    };
  });
