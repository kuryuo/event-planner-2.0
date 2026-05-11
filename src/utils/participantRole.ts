import type {ParticipantRoleKind} from '@/types/api/Event.ts';

const PARTICIPANT_ROLES: ParticipantRoleKind[] = ['Organizer', 'Editor', 'Assistant', 'Observer'];

export const normalizeParticipantRole = (
    role?: string | null,
): ParticipantRoleKind | null => {
    if (!role) return null;

    const trimmed = role.trim();
    if ((PARTICIPANT_ROLES as string[]).includes(trimmed)) {
        return trimmed as ParticipantRoleKind;
    }

    const lowered = trimmed.toLowerCase();
    if (lowered.includes('organizer') || lowered.includes('организатор')) return 'Organizer';
    if (lowered.includes('editor') || lowered.includes('редактор')) return 'Editor';
    if (lowered.includes('assistant') || lowered.includes('помощник')) return 'Assistant';
    if (lowered.includes('observer') || lowered.includes('наблюдатель')) return 'Observer';

    return null;
};

export const isOrganizerRole = (role?: string | null): boolean =>
    normalizeParticipantRole(role) === 'Organizer';

/**
 * Полный контроль на вкладке «Обзор»: статус, кебаб (отмена/шаблон/удаление), управление участниками.
 * Редактор, помощник и наблюдатель не получают эти действия, даже если указаны как ответственные.
 */
export const canManageEventOrgOverview = ({
    role,
    userId,
    responsiblePersonId,
}: {
    role?: string | null;
    userId?: string | null;
    responsiblePersonId?: string | null;
}): boolean => {
    const r = normalizeParticipantRole(role);
    if (r === 'Editor' || r === 'Assistant' || r === 'Observer') return false;
    return isEventOrganizer({role, userId, responsiblePersonId});
};

/**
 * Переход в редактор карточки мероприятия (кнопка «Редактировать»).
 */
export const canNavigateToEventEditor = ({
    role,
    userId,
    responsiblePersonId,
}: {
    role?: string | null;
    userId?: string | null;
    responsiblePersonId?: string | null;
}): boolean => {
    const r = normalizeParticipantRole(role);
    if (r === 'Assistant' || r === 'Observer') return false;
    if (r === 'Organizer' || r === 'Editor') return true;
    return Boolean(userId && responsiblePersonId && userId === responsiblePersonId);
};

export const getParticipantRoleName = (role?: string | null): string => {
    switch (normalizeParticipantRole(role)) {
        case 'Organizer':
            return 'Организатор';
        case 'Editor':
            return 'Редактор';
        case 'Assistant':
            return 'Помощник';
        case 'Observer':
            return 'Наблюдатель';
        default:
            return 'Без роли';
    }
};

export const isEventOrganizer = ({
    role,
    userId,
    responsiblePersonId,
}: {
    role?: string | null;
    userId?: string | null;
    responsiblePersonId?: string | null;
}): boolean => {
    if (isOrganizerRole(role)) return true;
    return Boolean(userId && responsiblePersonId && userId === responsiblePersonId);
};
