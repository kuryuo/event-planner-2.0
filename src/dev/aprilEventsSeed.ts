import type {CreateEventPayload} from '@/types/api/Event.ts';

// TODO REMOVE: временный сид для быстрого создания тестовых мероприятий за апрель.
export const APRIL_TEST_EVENTS: CreateEventPayload[] = [
    {
        // TODO REMOVE: временные апрельские тестовые мероприятия.
        name: 'Лекция для стажеров (апрель)',
        description: 'Введение в процессы разработки и code review.',
        startDate: '2026-04-03T06:00:00.000Z',
        endDate: '2026-04-03T07:30:00.000Z',
        location: 'Екатеринбург, офис UDV',
        auditorium: 'Переговорка A1',
        venueFormat: 'Online',
        categories: ['Обучение', 'Стажировка'],
        types: ['Lecture'],
        maxParticipants: 0,
        color: '#C2298A',
    },
    {
        name: 'Лекция по API интеграции (апрель)',
        description: 'Практическая лекция по интеграции с backend API.',
        startDate: '2026-04-10T06:00:00.000Z',
        endDate: '2026-04-10T07:30:00.000Z',
        location: 'Екатеринбург, офис UDV',
        auditorium: 'Переговорка B2',
        venueFormat: 'Online',
        categories: ['API', 'Frontend'],
        types: ['Lecture'],
        maxParticipants: 0,
        color: '#C2298A',
    },
    {
        name: 'Лекция по UX сценариям (апрель)',
        description: 'Разбор сценариев взаимодействия в сервисе мероприятий.',
        startDate: '2026-04-17T06:00:00.000Z',
        endDate: '2026-04-17T07:30:00.000Z',
        location: 'Екатеринбург, офис UDV',
        auditorium: 'Переговорка C3',
        venueFormat: 'Online',
        categories: ['UX', 'Продукт'],
        types: ['Lecture'],
        maxParticipants: 0,
        color: '#C2298A',
    },
];
