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
    lifecycleStateToLabel,
    toLifecycleState,
} from '@/utils/eventLifecycle.ts';
import {useI18n} from '@/i18n/I18nProvider';

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

const resolveLifecycleState = ({
    lifecycleState,
    status,
    isCancelled,
}: {
    lifecycleState?: string | null;
    status?: string | null;
    isCancelled?: boolean;
}): EventLifecycleState => {
    if (isCancelled) return 'Cancelled';
    return toLifecycleState(lifecycleState, status);
};

const isLifecycleState = (value: string): value is EventLifecycleState =>
    value === 'Draft' ||
    value === 'Published' ||
    value === 'Completed' ||
    value === 'Cancelled' ||
    value === 'Archived';

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
    const {t, language} = useI18n();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<EventLifecycleState>(() =>
        resolveLifecycleState({lifecycleState, status, isCancelled}),
    );
    const statusOptions = useMemo<EventLifecycleState[]>(
        () => ['Draft', 'Published', 'Completed', 'Cancelled'],
        [],
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
                console.error('Failed to delete event:', err);
            }
        }
    };

    const handleStatusPick = useCallback(
        async (option: EventLifecycleState) => {
            if (!eventId || !canManageEventOrgOverview) {
                setSelectedStatus(option);
                setIsStatusOpen(false);
                return;
            }

            const previousStatus = selectedStatus;
            setSelectedStatus(option);
            setIsStatusOpen(false);

            try {
                await updateLifecycleState({eventId, lifecycleState: option}).unwrap();
                showSuccess(t('eventPage.statusUpdated'));
            } catch (error) {
                console.error('Failed to update event status:', error);
                setSelectedStatus(previousStatus);
                showApiError(error, t('eventPage.statusUpdateFailed'));
            }
        },
        [eventId, canManageEventOrgOverview, selectedStatus, showApiError, showSuccess, t, updateLifecycleState],
    );

    const statusMenuItems: MenuProps['items'] = useMemo(
        () => statusOptions.map((option) => ({
                key: option,
                label: (
                    <span className={styles.statusMenuRow}>
                        <span>{lifecycleStateToLabel(option, option)}</span>
                        {option === selectedStatus ? <Check2Icon className={styles.statusCheck}/> : null}
                    </span>
                ),
            })),
        [selectedStatus, statusOptions, language],
    );

    const tabItems = isArchived
        ? [{label: t('eventPage.overview')}, {label: t('eventPage.documentsTab')}, {label: t('eventPage.mediaTab')}]
        : [{label: t('eventPage.overview')}, {label: t('eventPage.documentsTab')}, {label: t('eventPage.kanbanTab')}, {label: t('eventPage.chat')}, {label: t('eventPage.mediaTab')}];
    const isOverviewTabActive = activeTab === 0;

    const handleTabChange = (index: number) => {
        if (onTabChange) {
            onTabChange(index);
        }
    };

    useEffect(() => {
        setSelectedStatus(resolveLifecycleState({lifecycleState, status, isCancelled}));
    }, [lifecycleState, status, isCancelled, language]);

    const selectedStatusLabel = lifecycleStateToLabel(selectedStatus, selectedStatus);
    const isCancelledNow = selectedStatus === 'Cancelled';
    const isCompletedNow = selectedStatus === 'Completed';
    const isReadOnlyLifecycle = isArchived || isCompletedNow;
    const canChangeStatus = canManageEventOrgOverview && !isReadOnlyLifecycle;

    return (
        <header className={styles.header}>
            {showSummary && <div className={styles.summaryRow}>
                <div className={styles.summaryLeft}>
                    <Avatar className="ep-avatar" shape="square" size={36} src={buildImageUrl(avatar)}>
                        {(name?.[0] ?? "—").toUpperCase()}
                    </Avatar>
                    <h2 className={styles.summaryTitle}>{name}</h2>
                    <span className={styles.summaryStatus}>{selectedStatusLabel}</span>
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
                            {canChangeStatus ? (
                                <Dropdown
                                    trigger={['click']}
                                    open={isStatusOpen}
                                    onOpenChange={setIsStatusOpen}
                                    menu={{
                                        items: statusMenuItems,
                                        onClick: ({key}) => {
                                            const selectedKey = String(key);
                                            if (!isLifecycleState(selectedKey)) {
                                                return;
                                            }
                                            void handleStatusPick(selectedKey);
                                        },
                                    }}
                                >
                                    <button
                                        type="button"
                                        className={styles.statusButton}
                                    >
                                        {selectedStatusLabel}
                                        <ChevronDownIcon className={styles.statusChevron}/>
                                    </button>
                                </Dropdown>
                            ) : (
                                <span className={styles.statusBadge}>{selectedStatusLabel}</span>
                            )}
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
                                        {t('eventPage.edit')}
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
                                                            setSelectedStatus(!isCancelledNow ? 'Cancelled' : 'Published');
                                                            setIsMenuOpen(false);
                                                            showSuccess(!isCancelledNow ? t('eventPage.eventCancelled') : t('eventPage.cancellationRemoved'));
                                                        } catch (error) {
                                                            console.error('Failed to update cancellation:', error);
                                                            showApiError(error, t('eventPage.cancellationUpdateFailed'));
                                                        }
                                                    }}
                                                    disabled={isUpdatingCancellation || isReadOnlyLifecycle}
                                                >
                                                    {isCancelledNow ? t('eventPage.cancellationRemoved') : t('eventPage.eventCancelled')}
                                                </Button>
                                                <Button
                                                    type="text"
                                                    className={`${styles.dropdownAction} ep-btn ep-btn--m ep-btn--text`}
                                                    onClick={async () => {
                                                        if (!eventId) return;
                                                        const templateName = window.prompt(t('eventPage.templateName'), `${name} template`);
                                                        if (!templateName?.trim()) return;
                                                        try {
                                                            await copyToTemplate({eventId, name: templateName.trim()}).unwrap();
                                                            setIsMenuOpen(false);
                                                            showSuccess(t('eventPage.templateSaved'));
                                                        } catch (error) {
                                                            console.error('Failed to create template:', error);
                                                            showApiError(error, t('eventPage.templateCreateFailed'));
                                                        }
                                                    }}
                                                    disabled={isCopyingTemplate}
                                                >
                                                    {isCopyingTemplate ? t('eventPage.creating') : t('eventPage.saveAsTemplate')}
                                                </Button>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<TrashIcon className={styles.trashIcon}/>}
                                                    className={`${styles.dropdownAction} ep-btn ep-btn--m ep-btn--text`}
                                                    onClick={handleDeleteClick}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? t('eventPage.deleting') : t('eventPage.deleteEvent')}
                                                </Button>
                                            </div>
                                        )}
                                    >
                                        <div className={styles.menuWrapper}>
                                            <button
                                                type="button"
                                                className={styles.menuButton}
                                                aria-label={t('eventPage.menu')}
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
