import type {Category} from '@/types/api/Category.ts';

const toCategory = (item: unknown, index: number): Category | null => {
    if (typeof item === 'string') {
        const name = item.trim();
        return name ? {id: `category-${index}-${name}`, name, eventCategories: null} : null;
    }

    if (!item || typeof item !== 'object') return null;

    const record = item as Record<string, unknown>;
    const name = String(record.name ?? record.title ?? record.label ?? '').trim();
    if (!name) return null;

    return {
        id: String(record.id ?? record.categoryId ?? `category-${index}-${name}`),
        name,
        eventCategories: Array.isArray(record.eventCategories)
            ? (record.eventCategories as string[])
            : null,
    };
};

export const normalizeCategoriesResponse = (response: unknown): Category[] => {
    const container = response as Record<string, unknown> | null | undefined;

    const rawItems = (() => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(container?.result)) return container.result;
        if (Array.isArray(container?.res)) return container.res;
        if (Array.isArray((container?.res as Record<string, unknown> | undefined)?.categories)) {
            return (container?.res as Record<string, unknown>).categories;
        }
        if (Array.isArray(container?.categories)) return container.categories;
        return [];
    })();

    return (rawItems as unknown[])
        .map((item: unknown, index: number) => toCategory(item, index))
        .filter((item): item is Category => item !== null);
};
