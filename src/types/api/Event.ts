// Универсальный тип события
export interface EventData {
    id?: string; // есть только в response
    responsiblePersonId?: string; // нужен при создании
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    format?: string;
    eventType?: string;
    maxParticipants?: number;
    categories?: string[];
    roles?: string[]; // только при создании
    previewPhotos?: string[]; // только в response
    status?: string | null; // только в response
}

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

export interface CreateEventResponse {
    result: EventData;
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
    result: EventData[];
}

// Response для GET /events/{id}
export interface GetEventByIdResponse {
    result: EventData;
}

// Подписка / отписка
export interface EventSubscribeResponse {
    result: string; // eventId
    userId: string;
}

// Общая структура Id+Name / Id+Url
export interface IdName {
    id: string;
    name: string;
}

export interface IdUrl {
    id: string;
    url: string;
}

// Роли
export type EventRole = IdName;

export interface GetRolesResponse {
    result: EventRole[];
}

// Подписчики
export interface EventSubscriber extends IdName {
    email?: string;
}

export interface GetSubscribersResponse {
    result: EventSubscriber[];
}

// Фото
export type EventPhoto = IdUrl;

export interface GetPhotosResponse {
    result: EventPhoto[];
}

// Контакты
export type EventContact = IdName;

export interface GetContactsResponse {
    result: EventContact[];
}

// Завершение мероприятия
export interface FinishEventResponse {
    result: string;
}
