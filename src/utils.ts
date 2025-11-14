/**
 * Форматирует диапазон времени события в виде "HH:MM - HH:MM".
 * Если хотя бы одна из дат отсутствует, возвращает пустую строку.
 *
 * @param start - дата начала события
 * @param end - дата окончания события
 * @returns строка с временем события
 */
export function formatTimeRange(start?: Date | null, end?: Date | null): string {
    if (!start || !end) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

/**
 * Форматирует метку текущего месяца или недели для тулбара календаря.
 * Для месячного вида возвращает "Месяц Год", для недельного — "День – День Месяц".
 *
 * @param currentDate - текущая дата календаря
 * @param currentView - вид календаря: 'dayGridMonth' или 'timeGridWeek'
 * @returns строка для отображения в тулбаре
 */
export function formatCalendarLabel(currentDate: Date, currentView: 'dayGridMonth' | 'timeGridWeek'): string {
    if (currentView === 'dayGridMonth') {
        return currentDate.toLocaleString('ru-RU', {month: 'long', year: 'numeric'})
            .replace(/^./, str => str.toUpperCase());
    }

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const monthName = endOfWeek.toLocaleString('ru-RU', {month: 'long'})
        .replace(/^./, str => str.toUpperCase());

    return `${startDay} – ${endDay} ${monthName}`;
}

/**
 * Сдвигает переданную дату на указанное количество месяцев.
 *
 * @param date - исходная дата
 * @param step - количество месяцев для сдвига (может быть отрицательным)
 * @returns новая дата, сдвинутая на step месяцев
 */
export function shiftMonth(date: Date, step: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + step);
    return newDate;
}

/**
 * Сдвигает переданную дату на указанное количество недель.
 * Сдвиг производится относительно понедельника недели.
 *
 * @param date - исходная дата
 * @param step - количество недель для сдвига (может быть отрицательным)
 * @returns новая дата, сдвинутая на step недель
 */
export function shiftWeek(date: Date, step: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + step * 7 - newDate.getDay() + 1);
    return newDate;
}
