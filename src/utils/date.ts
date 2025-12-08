import {format} from 'date-fns';
import {ru} from 'date-fns/locale';

/**
 * Объединяет дату и время в строку формата ISO.
 * Создает новую дату на основе переданной даты и устанавливает время из строки формата "HH:MM".
 * Если дата или время отсутствуют, возвращает undefined.
 *
 * @param date - объект Date, для которого устанавливается время
 * @param time - строка времени в формате "HH:MM"
 * @returns строка в формате ISO или undefined, если дата или время не переданы
 */
export const combineDateTime = (date: Date | undefined, time: string): string | undefined => {
    if (!date || !time) return undefined;
    const combined = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
};

/**
 * Парсит ISO строку даты и времени в объект с датой и временем.
 * 
 * @param dateTimeString - строка даты и времени в формате ISO
 * @returns объект с полями date (Date) и time (строка "HH:MM")
 */
export const parseDateTime = (dateTimeString: string): {date: Date | undefined; time: string} => {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
        return {date: undefined, time: ''};
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {
        date,
        time: `${hours}:${minutes}`
    };
};

/**
 * Форматирует дату в читаемый формат на русском языке.
 * Возвращает строку вида "15 января 2024".
 *
 * @param date - дата для форматирования
 * @returns отформатированная строка с датой на русском языке
 */
export const formatDate = (date: Date): string => {
    return format(date, "d MMMM yyyy", {locale: ru});
};

/**
 * Форматирует диапазон дат и времени в одну строку.
 * Если даты в один день: "1 ноября 2025, 6:11 - 10:55"
 * Если даты в разные дни: "1 ноября 6:11 - 2 ноября 10:55"
 *
 * @param startDate - дата начала (может быть строкой ISO или объектом Date)
 * @param endDate - дата окончания (может быть строкой ISO или объектом Date)
 * @returns отформатированная строка с диапазоном дат и времени
 */
export const formatDateTimeRange = (startDate: Date | string, endDate: Date | string): string => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const isSameDay = start.getDate() === end.getDate() &&
        start.getMonth() === end.getMonth() &&
        start.getFullYear() === end.getFullYear();

    if (isSameDay) {
        const datePart = format(start, "d MMMM yyyy", {locale: ru});
        const startTime = format(start, "HH:mm", {locale: ru});
        const endTime = format(end, "HH:mm", {locale: ru});
        return `${datePart}, ${startTime} - ${endTime}`;
    } else {
        const startFormatted = format(start, "d MMMM HH:mm", {locale: ru});
        const endFormatted = format(end, "d MMMM HH:mm", {locale: ru});
        return `${startFormatted} - ${endFormatted}`;
    }
};