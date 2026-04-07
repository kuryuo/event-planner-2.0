import {useState, useRef, useMemo, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import styles from './Header.module.scss';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import Avatar from '@/ui/avatar/Avatar';
import Button from '@/ui/button/Button';
import Tabs, {type TabItem} from '@/ui/tabs/Tabs';
import {useClickOutside} from '@/hooks/ui/useClickOutside.ts';
import {useEventDeleter} from '@/hooks/ui/useEventDeleter.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {useGetProfileEventsQuery} from "@/services/api/profileApi.ts";
import {
    useCopyEventToTemplateMutation,
    useSubscribeToEventMutation,
    useUnsubscribeFromEventMutation,
    useUpdateEventCancellationMutation,
    useUpdateEventLifecycleStateMutation
} from "@/services/api/eventApi.ts";
import type {EventLifecycleState, EventTypeKind, VenueFormat} from '@/types/api/Event.ts';

interface HeaderProps {
    isAdmin?: boolean;
    name: string;
    eventId?: string;
    activeTab?: number;
    avatar?: string | null;
    isArchived?: boolean;
    status?: string | null;
    updateData?: {
        name: string;
        description: string;
        startDate?: string | null;
        endDate?: string | null;
        location: string;
        venueFormat?: VenueFormat;
        types?: EventTypeKind[];
        maxParticipants?: number;
        color?: string;
    };
    onTabChange?: (index: number) => void;
    showSummary?: boolean;
    showTabs?: boolean;
    showMain?: boolean;
}

const STATUS_OPTIONS = ['Черновик', 'В работе', 'Завершено', 'Отменено'];

const statusLabelToApiValue: Record<string, EventLifecycleState> = {
    'Черновик': 'Draft',
    'В работе': 'Published',
    'Завершено': 'Completed',
    'Отменено': 'Cancelled',
};

const normalizeStatusLabel = (value?: string | null): string => {
    const normalized = (value ?? '').toLowerCase();
    if (normalized.includes('draft') || normalized.includes('чернов')) return 'Черновик';
    if (normalized.includes('work') || normalized.includes('progress') || normalized.includes('в работе')) return 'В работе';
    if (normalized.includes('cancel') || normalized.includes('отмен')) return 'Отменено';
    if (normalized.includes('done') || normalized.includes('finish') || normalized.includes('complete') || normalized.includes('заверш')) return 'Завершено';
    return 'Черновик';
};

export default function Header({
    isAdmin = false,
    name,
    eventId,
    activeTab = 0,
    avatar,
    isArchived = false,
    status,
    updateData: _updateData,
    onTabChange,
    showSummary = true,
    showTabs = true,
    showMain = true,
}: HeaderProps) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(() => normalizeStatusLabel(status));
    const menuRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const {handleDelete, isLoading: isDeleting} = useEventDeleter();
    
    const {data: subscribedEvents} = useGetProfileEventsQuery();
    const [subscribeToEvent] = useSubscribeToEventMutation();
    const [unsubscribeFromEvent] = useUnsubscribeFromEventMutation();
    const [updateLifecycleState] = useUpdateEventLifecycleStateMutation();
    const [updateCancellation, {isLoading: isUpdatingCancellation}] = useUpdateEventCancellationMutation();
    const [copyToTemplate, {isLoading: isCopyingTemplate}] = useCopyEventToTemplateMutation();
    
    const isSubscribed = useMemo(() => {
        if (!eventId || !subscribedEvents) return false;
        return subscribedEvents.some(event => event.id === eventId);
    }, [eventId, subscribedEvents]);

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
    useClickOutside(statusRef, () => setIsStatusOpen(false), isStatusOpen);

    const tabItems: TabItem[] = isArchived
        ? [{label: 'Обзор'}, {label: 'Документы'}, {label: 'Медиа'}]
        : [{label: 'Обзор'}, {label: 'Документы'}, {label: 'Kanban доска'}, {label: 'Чат'}, {label: 'Медиа'}];
    const isOverviewTabActive = activeTab === 0;

    const handleTabChange = (index: number) => {
        if (onTabChange) {
            onTabChange(index);
        }
    };

    useEffect(() => {
        setSelectedStatus(normalizeStatusLabel(status));
    }, [status]);

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

    const isCancelledNow = selectedStatus === 'Отменено';

    return (
        <header className={styles.header}>
            {showSummary && <div className={styles.summaryRow}>
                <div className={styles.summaryLeft}>
                    <Avatar size="S" shape="square" fallbackType="event" name={name} avatarUrl={buildImageUrl(avatar)}/>
                    <h2 className={styles.summaryTitle}>{name}</h2>
                    <span className={styles.summaryStatus}>{selectedStatus}</span>
                    <span className={styles.summaryRole}>{isAdmin ? 'Вы организатор' : 'Вы участник'}</span>
                </div>
            </div>}

            {showTabs && <div className={styles.tabs}>
                <Tabs items={tabItems} activeIndex={activeTab} onChange={handleTabChange}/>
            </div>}

            {showMain && !isArchived && isOverviewTabActive && (
                <div className={styles.main}>
                    <div className={styles.left}>
                        <Avatar size="L" shape="square" fallbackType="event" name={name} avatarUrl={buildImageUrl(avatar)}/>
                        <h2 className={styles.title}>{name}</h2>

                        <div className={styles.statusWrapper} ref={statusRef}>
                            <button
                                type="button"
                                className={styles.statusButton}
                                onClick={() => setIsStatusOpen((prev) => !prev)}
                            >
                                {selectedStatus}
                                <ChevronDownIcon className={styles.statusChevron}/>
                            </button>

                            {isStatusOpen && (
                                <div className={styles.statusDropdown}>
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            className={styles.statusOption}
                                            onClick={async () => {
                                                if (!eventId || !isAdmin) {
                                                    setSelectedStatus(option);
                                                    setIsStatusOpen(false);
                                                    return;
                                                }

                                                const previousStatus = selectedStatus;
                                                setSelectedStatus(option);
                                                setIsStatusOpen(false);

                                                try {
                                                    await updateLifecycleState({eventId, lifecycleState: statusLabelToApiValue[option]}).unwrap();
                                                } catch (error) {
                                                    console.error('Не удалось обновить статус мероприятия:', error);
                                                    setSelectedStatus(previousStatus);
                                                }
                                            }}
                                        >
                                            <span>{option}</span>
                                            {option === selectedStatus && <Check2Icon className={styles.statusCheck}/>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                             color="gray"
                                             onClick={async () => {
                                                 if (!eventId) return;
                                                 try {
                                                     await updateCancellation({eventId, isCancelled: !isCancelledNow}).unwrap();
                                                     setSelectedStatus(!isCancelledNow ? 'Отменено' : 'В работе');
                                                     setIsMenuOpen(false);
                                                 } catch (error) {
                                                     console.error('Не удалось обновить отмену:', error);
                                                 }
                                             }}
                                             disabled={isUpdatingCancellation}
                                         >
                                             {isCancelledNow ? 'Снять отмену' : 'Отменить мероприятие'}
                                         </Button>
                                         <Button
                                             variant="Text"
                                             color="gray"
                                             onClick={async () => {
                                                 if (!eventId) return;
                                                 const templateName = window.prompt('Название шаблона', `${name} шаблон`);
                                                 if (!templateName?.trim()) return;
                                                 try {
                                                     await copyToTemplate({eventId, name: templateName.trim()}).unwrap();
                                                     setIsMenuOpen(false);
                                                 } catch (error) {
                                                     console.error('Не удалось создать шаблон:', error);
                                                 }
                                             }}
                                             disabled={isCopyingTemplate}
                                         >
                                             {isCopyingTemplate ? 'Создаем...' : 'Сохранить как шаблон'}
                                         </Button>
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
            )}
        </header>
    );
}
