import type {EventLifecycleState, ParticipantRoleKind} from '@/types/api/Event.ts';
import {normalizeParticipantRole} from '@/utils/participantRole.ts';

export const LIFECYCLE_STATE_LABELS: Record<EventLifecycleState, string> = {
    Draft: 'Черновик',
    Published: 'В работе',
    Completed: 'Завершено',
    Cancelled: 'Отменено',
    Archived: 'В архиве',
};

const LIFECYCLE_STATE_ALIASES: Record<string, EventLifecycleState> = {
    draft: 'Draft',
    published: 'Published',
    completed: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    archived: 'Archived',
};

export const lifecycleStateToLabel = (
    lifecycleState?: string | null,
    status?: string | null,
): string => {
    const raw = (lifecycleState ?? status ?? '').trim();
    if (!raw) return LIFECYCLE_STATE_LABELS.Draft;

    if (raw in LIFECYCLE_STATE_LABELS) {
        return LIFECYCLE_STATE_LABELS[raw as EventLifecycleState];
    }

    const normalizedKey = LIFECYCLE_STATE_ALIASES[raw.toLowerCase()];
    if (normalizedKey) {
        return LIFECYCLE_STATE_LABELS[normalizedKey];
    }

    const lowered = raw.toLowerCase();
    if (lowered.includes('draft') || lowered.includes('чернов')) return LIFECYCLE_STATE_LABELS.Draft;
    if (lowered.includes('publish') || lowered.includes('work') || lowered.includes('progress') || lowered.includes('в работе')) {
        return LIFECYCLE_STATE_LABELS.Published;
    }
    if (lowered.includes('cancel') || lowered.includes('отмен')) return LIFECYCLE_STATE_LABELS.Cancelled;
    if (lowered.includes('archive') || lowered.includes('архив')) return LIFECYCLE_STATE_LABELS.Archived;
    if (lowered.includes('done') || lowered.includes('finish') || lowered.includes('complete') || lowered.includes('заверш')) {
        return LIFECYCLE_STATE_LABELS.Completed;
    }

    return raw;
};

export const labelToLifecycleState = (label: string): EventLifecycleState => {
    const entry = Object.entries(LIFECYCLE_STATE_LABELS).find(([, value]) => value === label);
    return (entry?.[0] as EventLifecycleState) ?? 'Draft';
};

export const getParticipantRoleLabel = (
    role?: ParticipantRoleKind | string | null,
    isOrganizerFallback = false,
): string => {
    const normalizedRole = normalizeParticipantRole(role);
    if (normalizedRole === 'Organizer' || isOrganizerFallback) return 'Вы организатор';
    if (normalizedRole === 'Editor') return 'Вы редактор';
    if (normalizedRole === 'Assistant') return 'Вы помощник';
    if (normalizedRole === 'Observer') return 'Вы наблюдатель';
    return 'Вы участник';
};
