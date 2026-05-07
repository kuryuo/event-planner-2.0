import {useMemo, useState} from 'react';
import {Dropdown} from 'antd';
import type {MenuProps} from 'antd';
import {Avatar} from "antd";
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import XIcon from '@/assets/img/icon-s/x.svg?react';
import OwnerIcon from '@/assets/image/owner-icon.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import {
    useGetEventRolesQuery,
    useAssignUserRoleMutation
} from '@/services/api/eventApi';
import styles from './ParticipantCard.module.scss';
import {isOrganizerRole} from '@/utils/participantRole.ts';
import {Tag} from "antd";

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

    const isOrganizer = isOrganizerRole(currentRoleValue);
    const tagTextStyleM = {
        fontFamily: "'Manrope', sans-serif",
        fontSize: 14,
        fontWeight: 450,
        lineHeight: "18px",
        padding: "2px 16px",
        borderRadius: "999px",
        marginInlineEnd: 0,
        userSelect: "none",
    } as const;

    const roleMenuItems: MenuProps['items'] = useMemo(
        () =>
            (isLoadingRoles ? [] : roleOptions).map((option) => ({
                key: option.value,
                label: (
                    <span className={styles.roleMenuItem}>
                        <span>{option.label}</span>
                        {currentRoleLabel === option.label ? (
                            <Check2Icon className={styles.roleMenuCheck}/>
                        ) : null}
                    </span>
                ),
            })),
        [isLoadingRoles, roleOptions, currentRoleLabel],
    );

    return (
        <div className={styles.participantCard}>
            <div className={styles.leftSection}>
                <Avatar className="ep-avatar" size={48} src={avatarUrl || undefined}>
                    {(name?.[0] ?? "—").toUpperCase()}
                </Avatar>
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
                    <Dropdown
                        trigger={['click']}
                        disabled={isOrganizer}
                        open={isRoleMenuOpen}
                        onOpenChange={setIsRoleMenuOpen}
                        placement="bottomRight"
                        menu={{
                            items: roleMenuItems,
                            onClick: ({key}) => {
                                void handleRoleClick(String(key));
                                setIsRoleMenuOpen(false);
                            },
                        }}
                    >
                        <button
                            type="button"
                            className={styles.roleButtonAsSelect}
                            disabled={isOrganizer}
                        >
                            <span>{currentRoleLabel}</span>
                            {!isOrganizer ? <ChevronDownIcon className={styles.chevronIcon}/> : null}
                        </button>
                    </Dropdown>
                )}

                {!canEditRoles && !isOrganizer && (
                    <Tag
                        bordered={false}
                        style={{
                            ...tagTextStyleM,
                            backgroundColor: "var(--bg-purple)",
                            color: "var(--content-purple)",
                        }}
                    >
                        {currentRoleLabel}
                    </Tag>
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
