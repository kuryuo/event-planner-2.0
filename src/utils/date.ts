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
 * Форматирует дату в читаемый формат на русском языке.
 * Возвращает строку вида "15 января 2024".
 *
 * @param date - дата для форматирования
 * @returns отформатированная строка с датой на русском языке
 */
export const formatDate = (date: Date): string => {
    return format(date, "d MMMM yyyy", {locale: ru});
};