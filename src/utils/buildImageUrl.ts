const BASE_URL = 'http://95.82.231.190:5002/';

export function buildImageUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
}