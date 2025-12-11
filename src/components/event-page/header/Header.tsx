import {useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import styles from './Header.module.scss';
import ChevronLeftIcon from '@/assets/img/icon-s/chevron-left.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import Avatar from '@/ui/avatar/Avatar';
import Button from '@/ui/button/Button';
import Tabs, {type TabItem} from '@/ui/tabs/Tabs';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';
import {useEventDeleter} from '@/hooks/ui/useEventDeleter.ts';

interface HeaderProps {
    isAdmin?: boolean;
    name: string;
    eventId?: string;
}

export default function Header({isAdmin = false, name, eventId}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const {handleDelete, isLoading: isDeleting} = useEventDeleter();
    const tabItems: TabItem[] = [
        {label: 'О мероприятии', badgeCount: 3},
        {label: 'Чат'},
        {label: 'Фотографии'},
    ];

    const handleTabChange = (index: number) => {
        console.log('Выбран таб:', index);
    };

    const handleBack = () => {
        navigate('/main');
    };

    const handleEdit = () => {
        if (eventId) {
            navigate(`/editor?id=${eventId}`);
        }
    };

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleDeleteClick = async () => {
        if (eventId) {
            try {
                await handleDelete(eventId);
                setIsMenuOpen(false);
            } catch (err) {
                console.error('Не удалось удалить событие:', err);
            }
        }
    };

    useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

    return (
        <header className={styles.header}>
            <button className={styles.backButton} onClick={handleBack}>
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
                                            onClick={handleDeleteClick}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Удаление...' : 'Удалить мероприятие'}
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
