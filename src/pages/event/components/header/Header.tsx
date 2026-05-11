import {useState, useMemo, useEffect, useCallback} from "react";
import {useNavigate} from 'react-router-dom';
import {Dropdown} from 'antd';
import type {MenuProps} from 'antd';
import styles from './Header.module.scss';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import Check2Icon from '@/assets/img/icon-m/check2.svg?react';
import ThreeDotsVerticalIcon from '@/assets/img/icon-m/three-dots-vertical.svg?react';
import TrashIcon from '@/assets/img/icon-m/trash.svg?react';
import {Avatar, Tabs} from "antd";
import {Button} from "antd";
import {useEventDeleter} from '@/hooks/ui/useEventDeleter.ts';
import {useApiToast} from '@/hooks/ui/useApiToast.ts';
import {buildImageUrl} from '@/utils/buildImageUrl.ts';
import {
    useCopyEventToTemplateMutation,
    useUpdateEventCancellationMutation,
    useUpdateEventLifecycleStateMutation
} from "@/services/api/eventApi.ts";
import type {EventLifecycleState, ParticipantRoleKind} from '@/types/api/Event.ts';
import {
    getParticipantRoleLabel,
    labelToLifecycleState,
    lifecycleStateToLabel,
} from '@/utils/eventLifecycle.ts';

interface HeaderProps {
    /** Статус мероприятия, кебаб (отмена / шаблон / удаление), полное управление участниками */
    canManageEventOrgOverview?: boolean;
    /** Кнопка «Редактировать» (карточка в редакторе) */
    canNavigateToEventEditor?: boolean;
    name: string;
    eventId?: string;
    activeTab?: number;
    avatar?: string | null;
    isArchived?: boolean;
    lifecycleState?: EventLifecycleState | string | null;
    status?: string | null;
    isCancelled?: boolean;
    participantRole?: ParticipantRoleKind | string | null;
    onTabChange?: (index: number) => void;
    showSummary?: boolean;
    showTabs?: boolean;
    showMain?: boolean;
}

const STATUS_OPTIONS = ['Черновик', 'В работе', 'Завершено', 'Отменено'];

const resolveLifecycleLabel = ({
    lifecycleState,
    status,
    isCancelled,
}: {
    lifecycleState?: string | null;
    status?: string | null;
    isCancelled?: boolean;
}): string => {
    if (isCancelled) return 'Отменено';
    return lifecycleStateToLabel(lifecycleState, status);
};

export default function Header({
    canManageEventOrgOverview = false,
    canNavigateToEventEditor = false,
    name,
    eventId,
    activeTab = 0,
    avatar,
    isArchived = false,
    lifecycleState,
    status,
    isCancelled = false,
    participantRole,
    onTabChange,
    showSummary = true,
    showTabs = true,
    showMain = true,
}: HeaderProps) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(() =>
        resolveLifecycleLabel({lifecycleState, status, isCancelled}),
    );
    const roleLabel = getParticipantRoleLabel(participantRole, canManageEventOrgOverview);
    const {handleDelete, isLoading: isDeleting} = useEventDeleter();
    const {showApiError, showSuccess} = useApiToast();

    const [updateLifecycleState] = useUpdateEventLifecycleStateMutation();
    const [updateCancellation, {isLoading: isUpdatingCancellation}] = useUpdateEventCancellationMutation();
    const [copyToTemplate, {isLoading: isCopyingTemplate}] = useCopyEventToTemplateMutation();

    const handleEdit = () => {
        if (eventId) {
            navigate(`/editor?id=${eventId}`);
        }
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

    const handleStatusPick = useCallback(
        async (option: string) => {
            if (!eventId || !canManageEventOrgOverview) {
                setSelectedStatus(option);
                setIsStatusOpen(false);
                return;
            }

            const previousStatus = selectedStatus;
            setSelectedStatus(option);
            setIsStatusOpen(false);

            try {
                await updateLifecycleState({eventId, lifecycleState: labelToLifecycleState(option)}).unwrap();
                showSuccess('Статус мероприятия обновлен');
            } catch (error) {
                console.error('Не удалось обновить статус мероприятия:', error);
                setSelectedStatus(previousStatus);
                showApiError(error, 'Не удалось обновить статус мероприятия');
            }
        },
        [eventId, canManageEventOrgOverview, selectedStatus, showApiError, showSuccess, updateLifecycleState],
    );

    const statusMenuItems: MenuProps['items'] = useMemo(
        () =>
            STATUS_OPTIONS.map((option) => ({
                key: option,
                label: (
                    <span className={styles.statusMenuRow}>
                        <span>{option}</span>
                        {option === selectedStatus ? <Check2Icon className={styles.statusCheck}/> : null}
                    </span>
                ),
            })),
        [selectedStatus],
    );

    const tabItems = isArchived
        ? [{label: 'Обзор'}, {label: 'Документы'}, {label: 'Медиа'}]
        : [{label: 'Обзор'}, {label: 'Документы'}, {label: 'Kanban доска'}, {label: 'Чат'}, {label: 'Медиа'}];
    const isOverviewTabActive = activeTab === 0;

    const handleTabChange = (index: number) => {
        if (onTabChange) {
            onTabChange(index);
        }
    };

    useEffect(() => {
        setSelectedStatus(resolveLifecycleLabel({lifecycleState, status, isCancelled}));
    }, [lifecycleState, status, isCancelled]);

    const isCancelledNow = selectedStatus === 'Отменено';
    const isCompletedNow = selectedStatus === 'Завершено';
    const isReadOnlyLifecycle = isArchived || isCompletedNow;

    return (
        <header className={styles.header}>
            {showSummary && <div className={styles.summaryRow}>
                <div className={styles.summaryLeft}>
                    <Avatar className="ep-avatar" shape="square" size={36} src={buildImageUrl(avatar)}>
                        {(name?.[0] ?? "—").toUpperCase()}
                    </Avatar>
                    <h2 className={styles.summaryTitle}>{name}</h2>
                    <span className={styles.summaryStatus}>{selectedStatus}</span>
                    <span className={styles.summaryRole}>{roleLabel}</span>
                </div>
            </div>}

            {showTabs && (
                <div className={styles.tabs}>
                    <Tabs
                        activeKey={String(activeTab)}
                        onChange={(key) => handleTabChange(Number(key))}
                        items={tabItems.map((item, index) => ({
                            key: String(index),
                            label: item.label,
                        }))}
                    />
                </div>
            )}

            {showMain && !isArchived && isOverviewTabActive && (
                <div className={styles.main}>
                    <div className={styles.left}>
                        <Avatar className="ep-avatar" shape="square" size={64} src={buildImageUrl(avatar)}>
                            {(name?.[0] ?? "—").toUpperCase()}
                        </Avatar>
                        <h2 className={styles.title}>{name}</h2>

                        <div className={styles.statusWrapper}>
                            <Dropdown
                                trigger={['click']}
                                disabled={!canManageEventOrgOverview || isReadOnlyLifecycle}
                                open={isStatusOpen}
                                onOpenChange={setIsStatusOpen}
                                menu={{
                                    items: statusMenuItems,
                                    onClick: ({key}) => {
                                        void handleStatusPick(String(key));
                                    },
                                }}
                            >
                                <button
                                    type="button"
                                    className={styles.statusButton}
                                    disabled={!canManageEventOrgOverview || isReadOnlyLifecycle}
                                >
                                    {selectedStatus}
                                    <ChevronDownIcon className={styles.statusChevron}/>
                                </button>
                            </Dropdown>
                        </div>
                    </div>
                    <div className={styles.right}>
                        {(canNavigateToEventEditor || canManageEventOrgOverview) && (
                            <div className={styles.adminActions}>
                                {canNavigateToEventEditor && (
                                    <Button
                                        type="default"
                                        className="ep-btn ep-btn--m ep-btn--filled-gray"
                                        onClick={handleEdit}
                                        disabled={isReadOnlyLifecycle}
                                    >
                                        Редактировать
                                    </Button>
                                )}
                                {canManageEventOrgOverview && (
                                    <Dropdown
                                        trigger={['click']}
                                        open={isMenuOpen}
                                        onOpenChange={setIsMenuOpen}
                                        placement="bottomRight"
                                        dropdownRender={() => (
                                            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    type="text"
                                                    className={`${styles.dropdownAction} ep-btn ep-btn--m ep-btn--text`}
                                                    onClick={async () => {
                                                        if (!eventId) return;
                                                        try {
                                                            await updateCancellation({eventId, isCancelled: !isCancelledNow}).unwrap();
                                                            setSelectedStatus(!isCancelledNow ? 'Отменено' : 'В работе');
                                                            setIsMenuOpen(false);
                                                            showSuccess(!isCancelledNow ? 'Мероприятие отменено' : 'Отмена снята');
                                                        } catch (error) {
                                                            console.error('Не удалось обновить отмену:', error);
                                                            showApiError(error, 'Не удалось обновить отмену мероприятия');
                                                        }
                                                    }}
                                                    disabled={isUpdatingCancellation || isReadOnlyLifecycle}
                                                >
                                                    {isCancelledNow ? 'Снять отмену' : 'Отменить мероприятие'}
                                                </Button>
                                                <Button
                                                    type="text"
                                                    className={`${styles.dropdownAction} ep-btn ep-btn--m ep-btn--text`}
                                                    onClick={async () => {
                                                        if (!eventId) return;
                                                        const templateName = window.prompt('Название шаблона', `${name} шаблон`);
                                                        if (!templateName?.trim()) return;
                                                        try {
                                                            await copyToTemplate({eventId, name: templateName.trim()}).unwrap();
                                                            setIsMenuOpen(false);
                                                            showSuccess('Шаблон сохранен');
                                                        } catch (error) {
                                                            console.error('Не удалось создать шаблон:', error);
                                                            showApiError(error, 'Не удалось создать шаблон');
                                                        }
                                                    }}
                                                    disabled={isCopyingTemplate}
                                                >
                                                    {isCopyingTemplate ? 'Создаем...' : 'Сохранить как шаблон'}
                                                </Button>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<TrashIcon className={styles.trashIcon}/>}
                                                    className={`${styles.dropdownAction} ep-btn ep-btn--m ep-btn--text`}
                                                    onClick={handleDeleteClick}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? 'Удаление...' : 'Удалить мероприятие'}
                                                </Button>
                                            </div>
                                        )}
                                    >
                                        <div className={styles.menuWrapper}>
                                            <button
                                                type="button"
                                                className={styles.menuButton}
                                                aria-label="Меню"
                                            >
                                                <ThreeDotsVerticalIcon className={styles.menuIcon}/>
                                            </button>
                                        </div>
                                    </Dropdown>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
