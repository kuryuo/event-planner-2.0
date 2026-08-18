import type {EventTypeKind} from '@/types/api/Event.ts';
import {translate} from '@/i18n/index';

export const EVENT_TYPE_LABELS: Record<string, string> = {
    Hackathon: 'event.types.Hackathon',
    Hackaton: 'event.types.Hackathon',
    hackathon: 'event.types.Hackathon',
    hackaton: 'event.types.Hackathon',
    'event.types.Hackathon': 'event.types.Hackathon',
    'event.types.hackathon': 'event.types.Hackathon',
    'event.types.Hackaton': 'event.types.Hackathon',
    'event.types.hackaton': 'event.types.Hackathon',
    Lecture: 'event.types.Lecture',
    PP: 'event.types.PP',
    SpecialCourse: 'event.types.SpecialCourse',
    Practice: 'event.types.Practice',
    CareerEvent: 'event.types.CareerEvent',
    CereerEvent: 'event.types.CareerEvent',
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
    EVENT_TYPE_LABELS[type] ? translate(EVENT_TYPE_LABELS[type]) : type;

export const normalizeEventTypes = (
    types?: Array<string | null | undefined> | null,
): EventTypeKind[] => {
    if (!types?.length) return [];

    return types
        .filter((type): type is string => Boolean(type))
        .map((type) => {
            if (type === 'CereerEvent') return 'CareerEvent';
            if (type === 'Hackaton' || type === 'hackaton') return 'Hackathon';
            if (type === 'event.types.Hackaton' || type === 'event.types.hackaton') return 'Hackathon';
            if (type === 'event.types.Hackathon' || type === 'event.types.hackathon') return 'Hackathon';
            return type;
        })
        .map((type) => type as EventTypeKind);
};
