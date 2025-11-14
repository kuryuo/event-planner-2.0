export type AppColor =
    | "brand-green"
    | "pink"
    | "plum"
    | "purple"
    | "deep-purple"
    | "indigo"
    | "blue"
    | "cyan"
    | "teal"
    | "green"
    | "orange"
    | "deep-orange"
    | "brown"
    | "brand-purple";

export const SLOT_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
};

export const CALENDAR_SLOT_TIMES = {
    min: '09:00:00',
    max: '22:00:00',
};

export const CALENDAR_OPTIONS = {
    allDaySlot: false,
    fixedWeekCount: false,
    dayMaxEventRows: 3,
    moreLinkClick: 'popover' as const,
    height: 'auto' as const,
    nowIndicator: true,
    selectable: true,
};

export const EVENTS = [
    {title: 'Событие 1', start: '2025-11-10T10:00:00', end: '2025-11-10T16:40:00'},
    {title: 'Событие 2', start: '2025-11-11T14:00:00', end: '2025-11-11T16:00:00'},
    {title: 'Событие 3', start: '2025-11-11T14:00:00', end: '2025-11-11T16:00:00'},
    {title: 'Событие 4', start: '2025-11-11T14:00:00', end: '2025-11-11T16:00:00'},
    {title: 'Событие 5', start: '2025-11-11T14:00:00', end: '2025-11-11T16:00:00'},
];