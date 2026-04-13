import {useEffect, useMemo, useRef, useState} from 'react';
import {ControlledBoard, moveCard, type Card, type Column, type KanbanBoard} from '@caldwell619/react-kanban';
import '@caldwell619/react-kanban/dist/styles.css';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import FilterIcon from '@/assets/img/icon-m/filter.svg?react';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import Button from '@/ui/button/Button';
import Checkbox from '@/ui/checkbox/Checkbox';
import Switch from '@/ui/switch/Switch';
import BoardColumnHeader from '@/pages/tasks/components/BoardColumnHeader';
import AddColumnButton from '@/pages/tasks/components/AddColumnButton';
import BoardTaskCard from '@/components/tasks/board-task-card/BoardTaskCard';
import TaskInlineCreator from '@/components/tasks/task-inline-creator/TaskInlineCreator';
import ProfileActionModal from '@/components/profile-page/ProfileActionModal';
import {
    useCreateBoardColumnMutation,
    useCreateBoardTaskMutation,
    useDeleteBoardColumnMutation,
    useGetEventBoardQuery,
    useGetEventBoardFacetsQuery,
    useGetEventSubscribersQuery,
    useMoveBoardTaskMutation,
    useUpdateBoardColumnMutation,
} from '@/services/api/eventApi.ts';
import type {GetEventBoardPayload} from '@/types/api/Event.ts';
import styles from './EventKanbanTab.module.scss';

type BoardCard = Card & {
    id: string;
    taskId: string;
    title: string;
    description?: string;
    dueDate?: string;
    assigneeName: string;
    assigneeAvatar?: string;
    priority: 'Срочный' | 'Высокий' | 'Средний' | 'Низкий';
    commentsCount: number;
    isCreator?: boolean;
};

type BoardColumn = Column<BoardCard> & {
    id: string;
    title: string;
    cards: BoardCard[];
};

const toBoard = (payload: any): KanbanBoard<BoardCard> => {
    const sourceRaw = payload?.result ?? payload ?? {};
    const source = Array.isArray(sourceRaw) ? (sourceRaw[0] ?? {}) : sourceRaw;
    const columns = source?.columns ?? source?.boardColumns ?? [];

    return {
        columns: (Array.isArray(columns) ? columns : []).map((column: any, columnIndex: number) => {
            const tasks = column?.tasks ?? column?.boardTasks ?? [];

            return {
                id: String(column?.id ?? `column-${columnIndex}`),
                title: String(column?.name ?? 'Колонка'),
                cards: (Array.isArray(tasks) ? tasks : []).map((task: any, taskIndex: number) => ({
                    id: String(task?.id ?? `task-${taskIndex}`),
                    taskId: String(task?.id ?? `task-${taskIndex}`),
                    title: String(task?.title ?? 'Новая задача'),
                    description: String(task?.description ?? ''),
                    dueDate: task?.dueDate ?? task?.deadline ?? undefined,
                    assigneeName: String(task?.assigneeDisplayName ?? task?.assigneeName ?? task?.assignedUserName ?? 'Не назначено'),
                    assigneeAvatar: task?.assigneeAvatarUrl ?? task?.assigneeAvatar ?? undefined,
                    priority: task?.priority === 'Urgent'
                        ? 'Срочный'
                        : task?.priority === 'High'
                            ? 'Высокий'
                            : task?.priority === 'Low'
                                ? 'Низкий'
                                : 'Средний',
                    commentsCount: Number(task?.commentCount ?? task?.commentsCount ?? task?.comments?.length ?? 0),
                })),
            };
        }),
    };
};

interface Props {
    eventId: string;
}

export default function EventKanbanTab({eventId}: Props) {
    const [searchValue, setSearchValue] = useState('');
    const [mockSort, setMockSort] = useState<'urgentFirst' | 'newestFirst' | 'oldestFirst' | 'assigneeAsc'>('urgentFirst');
    const [filterDeadlineOverdue, setFilterDeadlineOverdue] = useState(false);
    const [filterDeadlineToday, setFilterDeadlineToday] = useState(false);
    const [filterDeadlineTomorrow, setFilterDeadlineTomorrow] = useState(false);
    const [filterDeadlineThisWeek, setFilterDeadlineThisWeek] = useState(false);
    const [filterPriorityUrgent, setFilterPriorityUrgent] = useState(false);
    const [filterPriorityHigh, setFilterPriorityHigh] = useState(false);
    const [filterPriorityMedium, setFilterPriorityMedium] = useState(false);
    const [filterPriorityLow, setFilterPriorityLow] = useState(false);
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

    const boardQueryParams = useMemo<GetEventBoardPayload>(() => {
        const deadlines = [
            filterDeadlineOverdue && 'Overdue',
            filterDeadlineToday && 'Today',
            filterDeadlineTomorrow && 'Tomorrow',
            filterDeadlineThisWeek && 'ThisWeek',
        ].filter(Boolean).join(',');
        const priorities = [
            filterPriorityUrgent && 'Urgent',
            filterPriorityHigh && 'High',
            filterPriorityMedium && 'Medium',
            filterPriorityLow && 'Low',
        ].filter(Boolean).join(',');
        return {
            eventId,
            q: searchValue.trim() || undefined,
            deadlines: deadlines || undefined,
            priorities: priorities || undefined,
            assigneeIds: selectedAssigneeIds.length ? selectedAssigneeIds.join(',') : undefined,
            mineOnly: onlyMyTasks || undefined,
            sort: mockSort === 'urgentFirst'
                ? 'UrgentFirst'
                : mockSort === 'newestFirst'
                    ? 'Newest'
                    : mockSort === 'oldestFirst'
                        ? 'Oldest'
                        : 'AssigneeAsc',
        };
    }, [eventId, searchValue, filterDeadlineOverdue, filterDeadlineToday, filterDeadlineTomorrow, filterDeadlineThisWeek, filterPriorityUrgent, filterPriorityHigh, filterPriorityMedium, filterPriorityLow, selectedAssigneeIds, onlyMyTasks, mockSort]);

    const {data: boardData, refetch} = useGetEventBoardQuery(boardQueryParams, {
        skip: !eventId,
        refetchOnFocus: true,
        refetchOnReconnect: true,
        pollingInterval: 120000,
    });
    const {data: boardFacets} = useGetEventBoardFacetsQuery(eventId, {skip: !eventId});
    const {data: subscribersData} = useGetEventSubscribersQuery({eventId, count: 100, offset: 0}, {skip: !eventId});
    const [moveTask] = useMoveBoardTaskMutation();
    const [createColumn] = useCreateBoardColumnMutation();
    const [updateColumn] = useUpdateBoardColumnMutation();
    const [deleteColumn] = useDeleteBoardColumnMutation();
    const [createTask] = useCreateBoardTaskMutation();

    const hydratedBoard = useMemo(() => toBoard(boardData), [boardData]);
    const [boardState, setBoardState] = useState<KanbanBoard<BoardCard>>({columns: []});
    const [creatingTaskColumnId, setCreatingTaskColumnId] = useState('');
    const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(null);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement | null>(null);
    const filterRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setBoardState(hydratedBoard);
    }, [hydratedBoard]);

    useEffect(() => {
        const onDocumentClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (sortRef.current && !sortRef.current.contains(target)) setIsSortOpen(false);
            if (filterRef.current && !filterRef.current.contains(target)) setIsFilterOpen(false);
        };

        document.addEventListener('mousedown', onDocumentClick);
        return () => document.removeEventListener('mousedown', onDocumentClick);
    }, []);

    const board = boardState.columns.length ? boardState : hydratedBoard;

    const preparedBoard = useMemo(() => ({
        columns: board.columns.map((column) => ({
                ...column,
                cards: creatingTaskColumnId === String(column.id)
                    ? [{
                        id: `creator-${column.id}`,
                        taskId: `creator-${column.id}`,
                        title: '',
                        description: '',
                        assigneeName: '',
                        priority: 'Средний' as const,
                        commentsCount: 0,
                        isCreator: true,
                    }, ...column.cards]
                    : column.cards,
            })),
    }), [board, creatingTaskColumnId]);

    const sortLabel =
        mockSort === 'urgentFirst'
            ? 'Сначала срочные'
            : mockSort === 'newestFirst'
                ? 'Сначала новые'
                : mockSort === 'oldestFirst'
                    ? 'Сначала старые'
                    : 'Исполнитель: А -> Я';

    const handleMoveCard = async (card: BoardCard, source: any, destination: any) => {
        setBoardState((current) => moveCard(current, source, destination));
        try {
            await moveTask({
                eventId,
                taskId: card.taskId,
                targetColumnId: String(destination.toColumnId),
                newOrder: destination.toPosition,
            }).unwrap();
        } catch {
            await refetch();
        }
    };

    const handleCreateColumn = async () => {
        const name = window.prompt('Название новой колонки');
        if (!name?.trim()) return;
        await createColumn({eventId, name: name.trim()}).unwrap();
        await refetch();
    };

    const handleRenameColumn = async (column: BoardColumn) => {
        const name = window.prompt('Новое название колонки', column.title);
        if (!name?.trim()) return;
        await updateColumn({eventId, columnId: String(column.id), name: name.trim()}).unwrap();
        await refetch();
    };

    const handleDeleteColumn = (column: BoardColumn) => {
        setColumnToDelete(column);
    };

    const confirmDeleteColumn = async () => {
        if (!columnToDelete) return;
        await deleteColumn({eventId, columnId: String(columnToDelete.id)}).unwrap();
        setColumnToDelete(null);
        await refetch();
    };

    const handleCreateTaskInColumn = async (
        columnId: string,
        payload: { title: string; assignedUserId?: string; dueDate?: string; description?: string },
    ) => {
        await createTask({
            eventId,
            columnId,
            title: payload.title.trim(),
            description: payload.description?.trim() || undefined,
            assignedUserId: payload.assignedUserId,
            dueDate: payload.dueDate,
        }).unwrap();
        setCreatingTaskColumnId('');
        await refetch();
    };

    const handleCreateTaskGlobal = async () => {
        const firstColumnId = board.columns[0]?.id;
        if (!firstColumnId) {
            window.alert('Сначала создайте колонку');
            return;
        }
        setCreatingTaskColumnId(String(firstColumnId));
    };

    const assigneeOptions = useMemo(() => {
        const users = subscribersData?.res?.users ?? [];
        return users
            .map((user) => ({id: user.id, name: user.name || 'Участник'}))
            .filter((user, index, arr) => arr.findIndex((item) => item.id === user.id) === index);
    }, [subscribersData]);

    const assigneeFacets = useMemo(() => Array.isArray(boardFacets?.result) ? boardFacets.result : [], [boardFacets]);

    return (
        <section className={styles.surface}>
            <div className={styles.controlsRow}>
                <div className={styles.leftControls}>
                    <label className={styles.searchControl}>
                        <SearchIcon/>
                        <input
                            type="text"
                            placeholder="Задача..."
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                        />
                    </label>
                    <div className={styles.controlDropdown} ref={filterRef}>
                        <button type="button" className={styles.filterControl} onClick={() => setIsFilterOpen((prev) => !prev)}>
                            <FilterIcon/>
                            <span>Фильтры</span>
                            <ChevronDownIcon className={isFilterOpen ? styles.chevronUp : ''}/>
                        </button>

                        {isFilterOpen && (
                            <div className={styles.filterMenu}>
                                <h4>Дедлайн</h4>
                                <label><Checkbox checked={filterDeadlineOverdue} onChange={() => setFilterDeadlineOverdue((prev) => !prev)}/>Просрочен</label>
                                <label><Checkbox checked={filterDeadlineToday} onChange={() => setFilterDeadlineToday((prev) => !prev)}/>Сегодня</label>
                                <label><Checkbox checked={filterDeadlineTomorrow} onChange={() => setFilterDeadlineTomorrow((prev) => !prev)}/>Завтра</label>
                                <label><Checkbox checked={filterDeadlineThisWeek} onChange={() => setFilterDeadlineThisWeek((prev) => !prev)}/>На этой неделе</label>

                                <h4>Исполнитель</h4>
                                {assigneeFacets.length === 0 ? (
                                    <button type="button" className={styles.assigneeMock}>
                                        <span>Нет исполнителей</span>
                                        <ChevronDownIcon className={styles.assigneeChevron}/>
                                    </button>
                                ) : assigneeFacets.map((assignee) => (
                                    <label key={assignee.id}>
                                        <Checkbox
                                            checked={selectedAssigneeIds.includes(assignee.id)}
                                            onChange={() => setSelectedAssigneeIds((prev) => prev.includes(assignee.id)
                                                ? prev.filter((id) => id !== assignee.id)
                                                : [...prev, assignee.id])}
                                        />
                                        {assignee.displayName || 'Участник'}
                                    </label>
                                ))}

                                <h4>Приоритет</h4>
                                <label><Checkbox checked={filterPriorityUrgent} onChange={() => setFilterPriorityUrgent((prev) => !prev)}/>Срочный</label>
                                <label><Checkbox checked={filterPriorityHigh} onChange={() => setFilterPriorityHigh((prev) => !prev)}/>Высокий</label>
                                <label><Checkbox checked={filterPriorityMedium} onChange={() => setFilterPriorityMedium((prev) => !prev)}/>Средний</label>
                                <label><Checkbox checked={filterPriorityLow} onChange={() => setFilterPriorityLow((prev) => !prev)}/>Низкий</label>

                                <div className={styles.onlyMyWrap}>
                                    <Switch checked={onlyMyTasks} onCheckedChange={setOnlyMyTasks} size="M"/>
                                    <span>Только мои задачи</span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.assigneeMock}
                                    onClick={() => {
                                        setFilterDeadlineOverdue(false);
                                        setFilterDeadlineToday(false);
                                        setFilterDeadlineTomorrow(false);
                                        setFilterDeadlineThisWeek(false);
                                        setFilterPriorityUrgent(false);
                                        setFilterPriorityHigh(false);
                                        setFilterPriorityMedium(false);
                                        setFilterPriorityLow(false);
                                        setOnlyMyTasks(false);
                                        setSelectedAssigneeIds([]);
                                        setSearchValue('');
                                    }}
                                >
                                    <span>Сбросить фильтры</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.rightControls}>
                    <div className={styles.controlDropdown} ref={sortRef}>
                        <button type="button" className={styles.sortControl} onClick={() => setIsSortOpen((prev) => !prev)}>
                            <ChevronDownIcon className={styles.sortIcon}/>
                            <span>{sortLabel}</span>
                        </button>

                        {isSortOpen && (
                            <div className={styles.sortMenu}>
                                <button type="button" onClick={() => { setMockSort('urgentFirst'); setIsSortOpen(false); }}>Сначала срочные</button>
                                <button type="button" onClick={() => { setMockSort('newestFirst'); setIsSortOpen(false); }}>Сначала новые</button>
                                <button type="button" onClick={() => { setMockSort('oldestFirst'); setIsSortOpen(false); }}>Сначала старые</button>
                                <button type="button" onClick={() => { setMockSort('assigneeAsc'); setIsSortOpen(false); }}>Исполнитель: А -&gt; Я</button>
                            </div>
                        )}
                    </div>
                    <Button variant="Filled" color="default" onClick={handleCreateTaskGlobal}>Создать задачу</Button>
                </div>
            </div>

            <div className={styles.boardWrap}>
                <ControlledBoard<BoardCard>
                    disableColumnDrag
                    renderCard={(card) => (
                        <div className={styles.taskCard}>
                            {card.isCreator ? (
                                <TaskInlineCreator
                                    users={assigneeOptions}
                                    onClose={() => setCreatingTaskColumnId('')}
                                    onSubmit={(payload) => {
                                        const columnId = String(creatingTaskColumnId);
                                        void handleCreateTaskInColumn(columnId, payload);
                                    }}
                                />
                            ) : (
                                <BoardTaskCard
                                    title={card.title}
                                    description={card.description}
                                    dueDate={card.dueDate}
                                    assigneeName={card.assigneeName}
                                    assigneeAvatar={card.assigneeAvatar}
                                    priority={card.priority}
                                    commentsCount={card.commentsCount}
                                />
                            )}
                        </div>
                    )}
                    renderColumnHeader={(column) => {
                        const boardColumn = column as BoardColumn;
                        const columnIndex = board.columns.findIndex((item) => String(item.id) === String(boardColumn.id));

                        return (
                            <BoardColumnHeader
                                title={boardColumn.title}
                                count={boardColumn.cards.length}
                                colorIndex={columnIndex >= 0 ? columnIndex : 0}
                                showActions
                                onCreateTask={() => setCreatingTaskColumnId(String(boardColumn.id))}
                                onRenameColumn={() => handleRenameColumn(boardColumn)}
                                onDeleteColumn={() => handleDeleteColumn(boardColumn)}
                            />
                        );
                    }}
                    onCardDragEnd={handleMoveCard}
                >
                    {preparedBoard}
                </ControlledBoard>

                <div className={styles.addColumnFloating}>
                    <AddColumnButton onClick={handleCreateColumn}/>
                </div>
            </div>

            <ProfileActionModal
                isOpen={Boolean(columnToDelete)}
                title={`Удалить колонку «${columnToDelete?.title ?? ''}»?`}
                description={`Все вложенные задачи (${columnToDelete?.cards.length ?? 0}) также будут безвозвратно удалены`}
                onClose={() => setColumnToDelete(null)}
                onConfirm={confirmDeleteColumn}
                confirmText="Удалить"
                cancelText="Отменить"
                confirmTone="danger"
            />
        </section>
    );
}
