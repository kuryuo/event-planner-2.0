import type {EventTypeKind} from '@/types/api/Event.ts';

export const EVENT_TYPE_LABELS: Record<string, string> = {
    Hackathon: 'Хакатон',
    Lecture: 'Лекция',
    PP: 'ПП',
    SpecialCourse: 'Спецкурс',
    Practice: 'Практика',
    CareerEvent: 'Карьерные мероприятия',
    CereerEvent: 'Карьерные мероприятия',
};

export const EVENT_TYPE_OPTIONS: EventTypeKind[] = [
    'Hackathon',
    'Lecture',
    'PP',
    'SpecialCourse',
    'Practice',
    'CareerEvent',
];

export const getEventTypeLabel = (type: string): string =>
    EVENT_TYPE_LABELS[type] ?? type;

export const normalizeEventTypes = (
    types?: Array<string | null | undefined> | null,
): EventTypeKind[] => {
    if (!types?.length) return [];

    return types
        .filter((type): type is string => Boolean(type))
        .map((type) => (type === 'CereerEvent' ? 'CareerEvent' : type) as EventTypeKind);
};
