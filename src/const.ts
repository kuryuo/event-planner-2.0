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

const COLOR_HEX_TO_APP_COLOR: Record<string, AppColor> = {
    "#C2298A": "pink",
    "#A1309D": "plum",
    "#7A0CA8": "purple",
    "#512DA8": "deep-purple",
    "#303F9F": "indigo",
    "#1976D2": "blue",
    "#0097A7": "cyan",
    "#00796B": "teal",
    "#388E3C": "green",
    "#F57C00": "orange",
    "#E64A19": "deep-orange",
    "#5D4037": "brown",
};

/**
 * Конвертирует hex цвет в AppColor
 * @param hexColor - hex цвет (например, "#A1309D")
 * @returns AppColor или "pink" по умолчанию
 */
export function hexToAppColor(hexColor?: string): AppColor {
    if (!hexColor) return "pink";
    return COLOR_HEX_TO_APP_COLOR[hexColor.toUpperCase()] || "pink";
}