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

export const EVENT_FORMAT_MAP: Record<string, string> = {
    "Очно": "offline",
    "Онлайн": "online",
    "Гибрид": "hybrid"
};

export const FORMAT_REVERSE_MAP: Record<string, string> = {
    "offline": "Очно",
    "online": "Онлайн",
    "hybrid": "Гибрид"
};