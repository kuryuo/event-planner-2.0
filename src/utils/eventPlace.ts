import type {VenueFormat} from '@/types/api/Event.ts';

interface FormatEventPlaceParams {
    location: string;
    auditorium?: string | null;
    venueFormat?: VenueFormat | string | null;
}

export const formatEventPlaceText = ({
    location,
    auditorium,
    venueFormat,
}: FormatEventPlaceParams): string => {
    const loc = location?.trim() ?? '';
    const aud = auditorium?.trim() ?? '';
    const vf = venueFormat as VenueFormat | undefined;

    if (vf === 'Online') {
        return aud || loc || 'Не указано';
    }
    if (vf === 'Hybrid') {
        if (loc && aud) return `${loc} · ${aud}`;
        return loc || aud || 'Не указано';
    }
    if (loc && aud) return `${loc}, ${aud}`;
    return loc || aud || 'Не указано';
};
