import {useState, useRef, useEffect} from 'react';
import styles from './ParticipantsFilterMenu.module.scss';
import Checkbox from '@/ui/checkbox/Checkbox';
import ChevronRightIcon from '@/assets/img/icon-m/chevron-right.svg?react';
import {useGetEventRolesQuery} from '@/services/api/eventApi';
import {useClickOutside} from '@/hooks/ui/useClickOutside';

interface ParticipantsFilterMenuProps {
    eventId: string;
    isOpen: boolean;
    onClose: () => void;
    selectedRoles: string[];
    onRoleToggle: (roleId: string) => void;
    inContacts: boolean;
    onInContactsToggle: () => void;
}

export default function ParticipantsFilterMenu({
    eventId,
    isOpen,
    onClose,
    selectedRoles,
    onRoleToggle,
    inContacts,
    onInContactsToggle,
}: ParticipantsFilterMenuProps) {
    const [showRolesMenu, setShowRolesMenu] = useState(false);
    const [rolesMenuPosition, setRolesMenuPosition] = useState({top: 0, left: 0});
    const menuRef = useRef<HTMLDivElement>(null);
    const rolesMenuRef = useRef<HTMLDivElement>(null);
    const roleItemRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {data: rolesData, isLoading: isLoadingRoles} = useGetEventRolesQuery(
        {eventId, count: 100},
        {skip: !isOpen || !eventId}
    );

    const roles = rolesData?.res || [];

    useClickOutside(menuRef, onClose, isOpen);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleRoleItemMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        // Вычисляем позицию подменю относительно элемента "роль"
        if (roleItemRef.current && menuRef.current) {
            const roleItemRect = roleItemRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            setRolesMenuPosition({
                top: roleItemRect.top,
                left: menuRect.right + 8, // 8px отступ от правого края меню
            });
        }
        
        setShowRolesMenu(true);
    };

    const handleRoleItemMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowRolesMenu(false);
        }, 100);
    };

    const handleRolesSubmenuMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowRolesMenu(true);
    };

    const handleRolesSubmenuMouseLeave = () => {
        setShowRolesMenu(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.menuContainer} ref={menuRef}>
            <div
                className={styles.roleItem}
                ref={roleItemRef}
                onMouseEnter={handleRoleItemMouseEnter}
                onMouseLeave={handleRoleItemMouseLeave}
            >
                <span className={styles.roleLabel}>роль</span>
                <ChevronRightIcon className={styles.chevronIcon} />
                {showRolesMenu && (
                    <div
                        className={styles.rolesSubmenu}
                        ref={rolesMenuRef}
                        style={{
                            top: `${rolesMenuPosition.top}px`,
                            left: `${rolesMenuPosition.left}px`,
                        }}
                        onMouseEnter={handleRolesSubmenuMouseEnter}
                        onMouseLeave={handleRolesSubmenuMouseLeave}
                    >
                        {isLoadingRoles ? (
                            <div className={styles.loading}>Загрузка...</div>
                        ) : roles.length === 0 ? (
                            <div className={styles.loading}>Ролей нет</div>
                        ) : (
                            roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={styles.roleOption}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRoleToggle(role.id);
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedRoles.includes(role.id)}
                                        onChange={() => onRoleToggle(role.id)}
                                    />
                                    <span className={styles.roleName}>{role.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className={styles.divider} />

            <div className={styles.inContactsItem} onClick={onInContactsToggle}>
                <Checkbox checked={inContacts} onChange={onInContactsToggle} />
                <span className={styles.inContactsLabel}>В контактах</span>
            </div>
        </div>
    );
}

