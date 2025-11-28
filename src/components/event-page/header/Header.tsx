import {useState, useRef} from "react";
import styles from './Header.module.scss';
import ChevronLeftIcon from '@/assets/img/icon-s/chevron-left.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import Avatar from '@/ui/avatar/Avatar';
import Button from '@/ui/button/Button';
import Tabs, {type TabItem} from '@/ui/tabs/Tabs';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';

interface HeaderProps {
    isAdmin?: boolean;
    name: string;
}

export default function Header({isAdmin = false, name}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const tabItems: TabItem[] = [
        {label: 'О мероприятии', badgeCount: 3},
        {label: 'Чат'},
        {label: 'Фотографии'},
    ];

    const handleTabChange = (index: number) => {
        console.log('Выбран таб:', index);
    };

    const handleEdit = () => {
        console.log('Редактировать мероприятие');
    };

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleDelete = () => {
        console.log('Удалить мероприятие');
        setIsMenuOpen(false);
    };

    useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

    return (
        <header className={styles.header}>
            <button className={styles.backButton}>
                <ChevronLeftIcon className={styles.icon}/>
                <span className={styles.text}>Назад</span>
            </button>

            <div className={styles.main}>
                <div className={styles.left}>
                    <Avatar size="L" name="Название мероприятия"/>
                    <h2 className={styles.title}>{name}</h2>
                </div>
                <div className={styles.right}>
                    {isAdmin ? (
                        <div className={styles.adminActions} ref={menuRef}>
                            <Button variant="Filled" color="gray" onClick={handleEdit}>
                                Редактировать
                            </Button>
                            <div className={styles.menuWrapper}>
                                <button
                                    className={styles.menuButton}
                                    onClick={handleMenuClick}
                                    aria-label="Меню"
                                >
                                    <ThreeDotsVerticalIcon className={styles.menuIcon}/>
                                </button>
                                {isMenuOpen && (
                                    <div className={styles.dropdown}>
                                        <Button
                                            variant="Text"
                                            color="red"
                                            leftIcon={<TrashIcon className={styles.trashIcon}/>}
                                            onClick={handleDelete}
                                        >
                                            Удалить мероприятие
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Button variant="Filled" color="purple">Я пойду</Button>
                    )}
                </div>
            </div>

            <div className={styles.tabs}>
                <Tabs items={tabItems} onChange={handleTabChange}/>
            </div>
        </header>
    );
}
