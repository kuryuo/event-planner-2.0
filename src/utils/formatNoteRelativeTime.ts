import {formatDistanceToNow} from 'date-fns';
import {ru} from 'date-fns/locale';

export const formatNoteRelativeTime = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    try {
        return formatDistanceToNow(new Date(iso), {addSuffix: true, locale: ru});
    } catch {
        return '—';
    }
};
