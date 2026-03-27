import {useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';
import Avatar from '@/ui/avatar/Avatar.tsx';
import Menu from '@/ui/menu/Menu.tsx';
import Chip from '@/ui/chip/Chip.tsx';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import XIcon from '@/assets/img/icon-s/x.svg?react';
import OwnerIcon from '@/assets/image/owner-icon.svg?react';
import {useClickOutside} from '@/hooks/ui/useClickOutside';
import { 
    useGetEventRolesQuery, 
    useAssignUserRoleMutation
} from '@/services/api/eventApi';
import styles from './ParticipantCard.module.scss';

const ROLE_MAP = {
    Организатор: 'Organizer',
    Редактор: 'Editor',
    Помощник: 'Assistant',
    Наблюдатель: 'Observer',
    Organizer: 'Organizer',
    Editor: 'Editor',
    Assistant: 'Assistant',
    Observer: 'Observer',
} as const;

const ROLE_LABELS: Record<string, string> = {
    Organizer: 'Организатор',
    Editor: 'Редактор',
    Assistant: 'Помощник',
    Observer: 'Наблюдатель',
};

const toRoleLabel = (role?: string | null): string => {
    if (!role) return 'Роль не назначена';
    return ROLE_LABELS[role] || role;
};

const toRoleValue = (role?: string | null): string => {
    if (!role) return '';
    return ROLE_MAP[role as keyof typeof ROLE_MAP] || role;
};

interface ParticipantCardProps {
    name: string;
    avatarUrl: string | null;
    role?: string | null;
    eventId: string;
    userId: string;
    onExclude?: () => void;
    showActions?: boolean;
    canEditRoles?: boolean;
}

export default function ParticipantCard({
    name,
    avatarUrl,
    role,
    eventId,
    userId,
    onExclude,
    showActions = true,
    canEditRoles = true,
}: ParticipantCardProps) {
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [alignRight, setAlignRight] = useState(false);
    const roleMenuRef = useRef<HTMLDivElement>(null);
    const roleButtonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {data: rolesData, isLoading: isLoadingRoles} = useGetEventRolesQuery(
        {eventId, count: 100},
        {skip: !isRoleMenuOpen || !eventId || !canEditRoles}
    );

    const [assignRole] = useAssignUserRoleMutation();

    const roles = rolesData?.res || [];

    const currentRoleValue = toRoleValue(role);
    const currentRoleLabel = toRoleLabel(role);
    const roleOptions = useMemo(() => {
        return roles.map((roleItem) => ({
            value: roleItem.name,
            label: toRoleLabel(roleItem.name),
        }));
    }, [roles]);

    const handleRoleClick = async (roleName: string) => {
        if (roleName === currentRoleValue) {
            return;
        }

        const participantRole = ROLE_MAP[roleName as keyof typeof ROLE_MAP];
        if (!participantRole) {
            return;
        }

        try {
            await assignRole({eventId, userId, participantRole}).unwrap();
        } catch (error) {
            console.error('Ошибка при назначении роли:', error);
        }
    };

    useClickOutside(roleMenuRef, () => {
        setIsRoleMenuOpen(false);
    }, isRoleMenuOpen);

    useEffect(() => {
        if (!isRoleMenuOpen) return;

        const updateDropdownPosition = () => {
            const buttonEl = roleButtonRef.current;
            const dropdownEl = dropdownRef.current;
            if (!buttonEl || !dropdownEl) return;

            const buttonRect = buttonEl.getBoundingClientRect();
            const dropdownRect = dropdownEl.getBoundingClientRect();
            const gap = 6;

            const shouldOpenUp =
                buttonRect.bottom + gap + dropdownRect.height > window.innerHeight
                && buttonRect.top - gap - dropdownRect.height >= 0;

            const shouldAlignRight =
                buttonRect.left + dropdownRect.width > window.innerWidth - 8
                && buttonRect.right - dropdownRect.width >= 8;

            setOpenUpward(shouldOpenUp);
            setAlignRight(shouldAlignRight);
        };

        const raf = window.requestAnimationFrame(updateDropdownPosition);
        window.addEventListener('resize', updateDropdownPosition);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', updateDropdownPosition);
        };
    }, [isRoleMenuOpen, roleOptions.length]);

    const isOrganizer = currentRoleValue === 'Organizer';

    return (
        <div className={styles.participantCard}>
            <div className={styles.leftSection}>
                <Avatar size="M" avatarUrl={avatarUrl || ''} name={name}/>
                <div className={styles.mainInfo}>
                    <span className={styles.name}>{name}</span>
                    {!canEditRoles && (
                        <span className={styles.roleText}>{currentRoleLabel}</span>
                    )}
                </div>
            </div>

            <div className={styles.rightSection}>
                {isOrganizer && (
                    <div className={styles.ownerBadge} aria-label="Организатор">
                        <OwnerIcon className={styles.ownerIcon}/>
                    </div>
                )}

                {canEditRoles && !isOrganizer && (
                    <div className={styles.roleSelector} ref={roleMenuRef}>
                        <button
                            ref={roleButtonRef}
                            type="button"
                            className={styles.roleButtonAsSelect}
                            onClick={() => setIsRoleMenuOpen((prev) => !prev)}
                            disabled={isOrganizer}
                        >
                            <span>{currentRoleLabel}</span>
                            {!isOrganizer && <ChevronDownIcon className={styles.chevronIcon}/>} 
                        </button>

                        {isRoleMenuOpen && !isOrganizer && (
                            <div
                                ref={dropdownRef}
                                className={clsx(
                                    styles.rolesDropdown,
                                    openUpward && styles.rolesDropdownUp,
                                    alignRight && styles.rolesDropdownAlignRight,
                                )}
                            >
                                <Menu
                                    shape="square"
                                    options={(isLoadingRoles ? [] : roleOptions).map((option) => ({
                                        label: option.label,
                                    }))}
                                    selectedValues={[currentRoleLabel]}
                                    onOptionClick={(_, index) => {
                                        const selectedOption = roleOptions[index];
                                        if (selectedOption) {
                                            void handleRoleClick(selectedOption.value);
                                        }
                                        setIsRoleMenuOpen(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {!canEditRoles && !isOrganizer && (
                    <Chip text={currentRoleLabel} size="M" variant="filled" color="purple"/>
                )}

                {showActions && !isOrganizer && (
                    <button
                        className={styles.menuButton}
                        aria-label="Исключить участника"
                        type="button"
                        onClick={() => onExclude?.()}
                    >
                        <XIcon className={styles.menuIcon}/>
                    </button>
                )}
            </div>
        </div>
    );
}

