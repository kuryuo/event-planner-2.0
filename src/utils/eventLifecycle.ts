import type {EventLifecycleState, ParticipantRoleKind} from '@/types/api/Event.ts';
import {normalizeParticipantRole} from '@/utils/participantRole.ts';
import {translate} from '@/i18n/index';

export const LIFECYCLE_STATE_LABELS: Record<EventLifecycleState, string> = {
    Draft: 'event.lifecycle.Draft',
    Published: 'event.lifecycle.Published',
    Completed: 'event.lifecycle.Completed',
    Cancelled: 'event.lifecycle.Cancelled',
    Archived: 'event.lifecycle.Archived',
};

const LIFECYCLE_STATE_ALIASES: Record<string, EventLifecycleState> = {
    draft: 'Draft',
    inprogress: 'Published',
    in_progress: 'Published',
    published: 'Published',
    completed: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
    archived: 'Archived',
};

export const toLifecycleState = (
    lifecycleState?: string | null,
    status?: string | null,
): EventLifecycleState => {
    const raw = (lifecycleState ?? status ?? '').trim();
    if (!raw) return 'Draft';

    if (raw in LIFECYCLE_STATE_LABELS) {
        return raw as EventLifecycleState;
    }

    const normalizedKey = LIFECYCLE_STATE_ALIASES[raw.toLowerCase()];
    if (normalizedKey) {
        return normalizedKey;
    }

    const lowered = raw.toLowerCase();
    if (lowered.includes('draft') || lowered.includes('чернов')) return 'Draft';
    if (lowered.includes('publish') || lowered.includes('work') || lowered.includes('progress') || lowered.includes('в работе')) {
        return 'Published';
    }
    if (lowered.includes('cancel') || lowered.includes('отмен')) return 'Cancelled';
    if (lowered.includes('archive') || lowered.includes('архив')) return 'Archived';
    if (lowered.includes('done') || lowered.includes('finish') || lowered.includes('complete') || lowered.includes('заверш')) {
        return 'Completed';
    }

    return 'Draft';
};

export const lifecycleStateToLabel = (
    lifecycleState?: string | null,
    status?: string | null,
): string => {
    const resolvedState = toLifecycleState(lifecycleState, status);
    return translate(LIFECYCLE_STATE_LABELS[resolvedState]);
};

export const labelToLifecycleState = (label: string): EventLifecycleState => {
    const entry = Object.entries(LIFECYCLE_STATE_LABELS).find(([, value]) => translate(value) === label);
    return (entry?.[0] as EventLifecycleState) ?? 'Draft';
};

export const getParticipantRoleLabel = (
    role?: ParticipantRoleKind | string | null,
    isOrganizerFallback = false,
): string => {
    const normalizedRole = normalizeParticipantRole(role);
    if (normalizedRole === 'Organizer' || isOrganizerFallback) return translate('event.roles.youOrganizer');
    if (normalizedRole === 'Editor') return translate('event.roles.youEditor');
    if (normalizedRole === 'Assistant') return translate('event.roles.youAssistant');
    if (normalizedRole === 'Observer') return translate('event.roles.youObserver');
    return translate('event.roles.notAssigned');
};
