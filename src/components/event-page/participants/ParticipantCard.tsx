import { useState, useRef } from 'react';
import { CardWithDropdown } from '@/ui/card/CardWithDropdown';
import Button from '@/ui/button/Button';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import PersonIcon from '@/assets/img/icon-m/person.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import { useClickOutside } from '@/hooks/ui/useClickOutside';
import styles from './ParticipantCard.module.scss';

interface ParticipantCardProps {
    name: string;
    avatarUrl: string | null;
    isInContacts?: boolean;
    onRemoveFromContacts?: () => void;
    onExclude?: () => void;
    showActions?: boolean;
}

export default function ParticipantCard({
    name,
    avatarUrl,
    isInContacts = false,
    onRemoveFromContacts,
    onExclude,
    showActions = true,
}: ParticipantCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    useClickOutside(menuRef, () => {
        setIsMenuOpen(false);
    }, isMenuOpen);


    const mockSubtitle = "Выберите действие";
    const mockSelectOptions = [
        {
            label: "Добавить в контакты",
            onClick: () => {
                console.log('Добавить в контакты');
            },
        },
        {
            label: "Написать сообщение",
            onClick: () => {
                console.log('Написать сообщение');
            },
        },
        {
            label: "Посмотреть профиль",
            onClick: () => {
                console.log('Посмотреть профиль');
            },
        },
    ];

    return (
        <div className={styles.participantCard}>
            <CardWithDropdown
                title={name}
                avatarUrl={avatarUrl || ''}
                size="M"
                subtitle={mockSubtitle}
                selectOptions={mockSelectOptions}
            />
            {showActions && (
                <div className={styles.rightSection}>
                    {isInContacts && (
                        <div className={styles.contactStatus}>
                            <Check2Icon className={styles.checkIcon} />
                            <span className={styles.contactLabel}>В контактах</span>
                        </div>
                    )}
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
                                <Button
                                    variant="Text"
                                    color="default"
                                    leftIcon={<PersonIcon className={styles.menuIcon} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFromContacts?.();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Убрать из контактов
                                </Button>
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
                </div>
            )}
        </div>
    );
}

