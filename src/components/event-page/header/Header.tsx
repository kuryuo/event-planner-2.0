import {useState, useRef, useMemo} from "react";
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
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useGetProfileEventsQuery} from "@/services/api/profileApi.ts";
import {useSubscribeToEventMutation, useUnsubscribeFromEventMutation} from "@/services/api/eventApi.ts";

interface HeaderProps {
    isAdmin?: boolean;
    name: string;
    eventId?: string;
    activeTab?: number;
    avatar?: string | null;
    onTabChange?: (index: number) => void;
}

export default function Header({isAdmin = false, name, eventId, activeTab = 0, avatar, onTabChange}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const {handleDelete, isLoading: isDeleting} = useEventDeleter();
    
    const {data: subscribedEvents} = useGetProfileEventsQuery();
    const [subscribeToEvent] = useSubscribeToEventMutation();
    const [unsubscribeFromEvent] = useUnsubscribeFromEventMutation();
    
    const isSubscribed = useMemo(() => {
        if (!eventId || !subscribedEvents) return false;
        return subscribedEvents.some(event => event.id === eventId);
    }, [eventId, subscribedEvents]);

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

    const tabItems: TabItem[] = [
        {label: 'О мероприятии', badgeCount: 3},
        {label: 'Чат'},
        {label: 'Фотографии'},
    ];

    const handleTabChange = (index: number) => {
        if (onTabChange) {
            onTabChange(index);
        }
    };

    const handleSubscribeClick = async () => {
        if (!eventId) return;
        
        try {
            if (isSubscribed) {
                await unsubscribeFromEvent(eventId).unwrap();
            } else {
                await subscribeToEvent(eventId).unwrap();
            }
        } catch (error) {
            console.error('Ошибка при подписке/отписке:', error);
        }
    };

    return (
        <header className={styles.header}>
            <button 
                type="button"
                className={styles.backButton} 
                onClick={handleBack}
            >
                <ChevronLeftIcon className={styles.icon}/>
                <span className={styles.text}>Назад</span>
            </button>
            <div className={styles.main}>
                <div className={styles.left}>
                    <Avatar size="L" name={name} avatarUrl={buildImageUrl(avatar)}/>
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
                        <Button 
                            variant="Filled" 
                            color={isSubscribed ? "gray" : "purple"}
                            onClick={handleSubscribeClick}
                        >
                            {isSubscribed ? "Я не пойду" : "Я пойду"}
                        </Button>
                    )}
                </div>
            </div>
            <div className={styles.tabs}>
                <Tabs items={tabItems} activeIndex={activeTab} onChange={handleTabChange}/>
            </div>
        </header>
    );
}
