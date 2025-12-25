import { useState, useRef } from 'react';
import { CardWithDropdown } from '@/ui/card/CardWithDropdown';
import Button from '@/ui/button/Button';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import PersonIcon from '@/assets/img/icon-m/person.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import { useClickOutside } from '@/hooks/ui/useClickOutside';
import { 
    useGetEventRolesQuery, 
    useAssignUserRoleMutation, 
    useCreateEventRoleMutation,
    useAddEventContactMutation,
    useRemoveEventContactMutation
} from '@/services/api/eventApi';
import styles from './ParticipantCard.module.scss';

interface ParticipantCardProps {
    name: string;
    avatarUrl: string | null;
    isInContacts?: boolean;
    role?: string | null;
    eventId: string;
    userId: string;
    onExclude?: () => void;
    showActions?: boolean;
}

export default function ParticipantCard({
    name,
    avatarUrl,
    isInContacts = false,
    role,
    eventId,
    userId,
    onExclude,
    showActions = true,
}: ParticipantCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const {data: rolesData, isLoading: isLoadingRoles} = useGetEventRolesQuery(
        {eventId, count: 100},
        {skip: !isSelectOpen || !eventId}
    );

    const [assignRole] = useAssignUserRoleMutation();
    const [createRole] = useCreateEventRoleMutation();
    const [addContact] = useAddEventContactMutation();
    const [removeContact] = useRemoveEventContactMutation();

    const roles = rolesData?.res || [];
    const currentRole = roles.find(r => r.name === role);
    const currentRoleId = currentRole?.id;

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSelectOpenChange = (isOpen: boolean) => {
        setIsSelectOpen(isOpen);
    };

    const handleRoleClick = async (roleId: string) => {
        if (roleId === currentRoleId) {
            return;
        }

        try {
            await assignRole({eventId, userId, roleId}).unwrap();
        } catch (error) {
            console.error('Ошибка при назначении роли:', error);
        }
    };

    const handleNewRoleCreate = async (roleName: string) => {
        try {
            await createRole({eventId, roleName}).unwrap();
        } catch (error) {
            console.error('Ошибка при создании роли:', error);
        }
    };

    const handleAddToContacts = async () => {
        try {
            await addContact({eventId, userId}).unwrap();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Ошибка при добавлении в контакты:', error);
        }
    };

    const handleRemoveFromContacts = async () => {
        try {
            await removeContact({eventId, userId}).unwrap();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Ошибка при удалении из контактов:', error);
        }
    };

    useClickOutside(menuRef, () => {
        setIsMenuOpen(false);
    }, isMenuOpen);

    const subtitle = role || "Роль не назначена";
    const isOrganizer = role === "Организатор";
    
    const selectOptions = roles.map((roleItem) => ({
        label: roleItem.name,
        description: undefined,
        onClick: () => handleRoleClick(roleItem.id),
    }));

    const selectedRoleLabel = currentRole?.name;

    return (
        <div className={styles.participantCard}>
            <CardWithDropdown
                title={name}
                avatarUrl={avatarUrl || ''}
                size="M"
                subtitle={subtitle}
                selectOptions={isSelectOpen && isLoadingRoles ? [] : selectOptions}
                onSelectOpenChange={handleSelectOpenChange}
                selectedValues={selectedRoleLabel ? [selectedRoleLabel] : []}
                withNewRoleInput={!isOrganizer}
                onNewRoleCreate={handleNewRoleCreate}
                disableRoleSelection={isOrganizer}
            />
            {showActions && (
                <div className={styles.rightSection}>
                    {isInContacts && (
                        <div className={styles.contactStatus}>
                            <Check2Icon className={styles.checkIcon} />
                            <span className={styles.contactLabel}>В контактах</span>
                        </div>
                    )}
                    {!isOrganizer && (
                        <div className={styles.menuWrapper} ref={menuRef}>
                            <button
                                className={styles.menuButton}
                                onClick={handleMenuToggle}
                                aria-label="Меню действий"
                                type="button"
                            >
                                <ThreeDotsVerticalIcon className={styles.menuIcon} />
                            </button>
                            {isMenuOpen && (
                                <div className={styles.dropdown}>
                                    {isInContacts ? (
                                        <Button
                                            variant="Text"
                                            color="default"
                                            leftIcon={<PersonIcon className={styles.menuIcon} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFromContacts();
                                            }}
                                        >
                                            Убрать из контактов
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="Text"
                                            color="default"
                                            leftIcon={<PersonIcon className={styles.menuIcon} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToContacts();
                                            }}
                                        >
                                            Добавить в контакты
                                        </Button>
                                    )}
                                    <div className={styles.divider} />
                                    <Button
                                        variant="Text"
                                        color="red"
                                        leftIcon={<TrashIcon className={styles.menuIcon} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExclude?.();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Исключить
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

