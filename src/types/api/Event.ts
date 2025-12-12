// Тип события из API response (GET /events, GET /events/{id}, POST /events response)
export interface EventResponse {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    responsiblePersonId: string;
    maxParticipants: number;
    categories: string[];
    previewPhotos: string[];
    status: string | null;
}

// Payload для создания мероприятия (POST /events)
export interface CreateEventPayload {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    responsiblePersonId: string;
    maxParticipants: number;
    categories: string[];
    roles: string[];
}

// Payload для GET /events (фильтры)
export interface GetEventsPayload {
    start?: string;
    end?: string;
    name?: string;
    organizers?: string[];
    format?: string;
    hasFreePlaces?: boolean;
    categories?: string[];
    offset?: number;
    count: number;
}

// Response для GET /events
export interface GetEventsResponse {
    result: EventResponse[];
}

// Response для GET /events/{id}
export interface GetEventByIdResponse {
    result: EventResponse;
}

// Payload для PUT /events/{id} (обновление мероприятия)
export interface UpdateEventPayload {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
    eventType: string;
    maxParticipants: number;
}

// Response для POST /events
export interface CreateEventResponse {
    result: EventResponse;
}

// Response для PUT /events/{id}
export interface UpdateEventResponse {
    result: EventResponse;
}

// Payload для GET /events/{eventId}/subscribers
export interface GetEventSubscribersPayload {
    eventId: string;
    name?: string;
    count?: number;
    offset?: number;
}

// Response для GET /events/{eventId}/subscribers
export interface GetEventSubscribersResponse {
    result: Array<{
        id: string;
        lastName: string;
        firstName: string;
        middleName: string;
        phoneNumber: string | null;
        telegram: string | null;
        city: string | null;
        avatarUrl: string | null;
    }>;
}