const BASE_URL = 'http://95.82.231.190:5002/';

/**
 * Строит полный URL для изображения на основе относительного пути.
 * Если путь уже является полным URL (начинается с 'http'), возвращает его без изменений.
 * Если путь отсутствует, возвращает undefined.
 *
 * @param path - относительный путь к изображению или полный URL
 * @returns полный URL изображения или undefined, если путь не передан
 */
export function buildImageUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
}