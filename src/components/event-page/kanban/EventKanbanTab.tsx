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
    useGetEventSubscribersQuery,
    useMoveBoardTaskMutation,
    useUpdateBoardColumnMutation,
} from '@/services/api/eventApi.ts';
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
                    assigneeName: String(task?.assigneeName ?? task?.assignedUserName ?? 'Не назначено'),
                    assigneeAvatar: task?.assigneeAvatar ?? undefined,
                    priority: (['Срочный', 'Высокий', 'Средний', 'Низкий'] as const)[taskIndex % 4],
                    commentsCount: Number(task?.commentsCount ?? task?.comments?.length ?? (taskIndex % 4)),
                })),
            };
        }),
    };
};

interface Props {
    eventId: string;
}

export default function EventKanbanTab({eventId}: Props) {
    const {data: boardData, refetch} = useGetEventBoardQuery(eventId, {skip: !eventId});
    const {data: subscribersData} = useGetEventSubscribersQuery({eventId, count: 100, offset: 0}, {skip: !eventId});
    const [moveTask] = useMoveBoardTaskMutation();
    const [createColumn] = useCreateBoardColumnMutation();
    const [updateColumn] = useUpdateBoardColumnMutation();
    const [deleteColumn] = useDeleteBoardColumnMutation();
    const [createTask] = useCreateBoardTaskMutation();

    const hydratedBoard = useMemo(() => toBoard(boardData), [boardData]);
    const [boardState, setBoardState] = useState<KanbanBoard<BoardCard>>({columns: []});
    const [searchValue, setSearchValue] = useState('');
    const [creatingTaskColumnId, setCreatingTaskColumnId] = useState('');
    const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(null);
    const [mockSort, setMockSort] = useState<'urgentFirst' | 'newestFirst' | 'oldestFirst' | 'assigneeAsc'>('urgentFirst');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterDeadlineOverdue, setFilterDeadlineOverdue] = useState(false);
    const [filterDeadlineToday, setFilterDeadlineToday] = useState(false);
    const [filterDeadlineTomorrow, setFilterDeadlineTomorrow] = useState(false);
    const [filterDeadlineThisWeek, setFilterDeadlineThisWeek] = useState(false);
    const [filterPriorityUrgent, setFilterPriorityUrgent] = useState(false);
    const [filterPriorityHigh, setFilterPriorityHigh] = useState(false);
    const [filterPriorityMedium, setFilterPriorityMedium] = useState(false);
    const [filterPriorityLow, setFilterPriorityLow] = useState(false);
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);
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
        columns: board.columns.map((column) => {
            let cards = column.cards.filter((card) => card.title.toLowerCase().includes(searchValue.trim().toLowerCase()));

            if (filterDeadlineOverdue) {
                const now = Date.now();
                cards = cards.filter((card) => card.dueDate && new Date(card.dueDate).getTime() < now);
            }
            if (filterDeadlineToday) {
                const today = new Date().toDateString();
                cards = cards.filter((card) => card.dueDate && new Date(card.dueDate).toDateString() === today);
            }
            if (filterDeadlineTomorrow) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toDateString();
                cards = cards.filter((card) => card.dueDate && new Date(card.dueDate).toDateString() === tomorrowStr);
            }
            if (filterDeadlineThisWeek) {
                const now = new Date();
                const weekEnd = new Date(now);
                weekEnd.setDate(now.getDate() + (7 - now.getDay()));
                cards = cards.filter((card) => {
                    if (!card.dueDate) return false;
                    const due = new Date(card.dueDate);
                    return due >= now && due <= weekEnd;
                });
            }

            if (filterPriorityUrgent || filterPriorityHigh || filterPriorityMedium || filterPriorityLow) {
                cards = cards.filter((_, idx) => {
                    if (filterPriorityUrgent && idx % 4 === 0) return true;
                    if (filterPriorityHigh && idx % 4 === 1) return true;
                    if (filterPriorityMedium && idx % 4 === 2) return true;
                    if (filterPriorityLow && idx % 4 === 3) return true;
                    return false;
                });
            }

            cards.sort((a, b) => {
                const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                if (mockSort === 'urgentFirst') return aTime - bTime;
                if (mockSort === 'oldestFirst') return a.taskId.localeCompare(b.taskId);
                if (mockSort === 'assigneeAsc') return a.title.localeCompare(b.title);
                return b.taskId.localeCompare(a.taskId);
            });

            return {
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
                    }, ...cards]
                    : cards,
            };
        }),
    }), [board, searchValue, mockSort, filterDeadlineOverdue, filterDeadlineToday, filterDeadlineTomorrow, filterDeadlineThisWeek, filterPriorityUrgent, filterPriorityHigh, filterPriorityMedium, filterPriorityLow, onlyMyTasks, creatingTaskColumnId]);

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
                                <button type="button" className={styles.assigneeMock}>
                                    <span>Исполнитель</span>
                                    <ChevronDownIcon className={styles.assigneeChevron}/>
                                </button>

                                <h4>Приоритет</h4>
                                <label><Checkbox checked={filterPriorityUrgent} onChange={() => setFilterPriorityUrgent((prev) => !prev)}/>Срочный</label>
                                <label><Checkbox checked={filterPriorityHigh} onChange={() => setFilterPriorityHigh((prev) => !prev)}/>Высокий</label>
                                <label><Checkbox checked={filterPriorityMedium} onChange={() => setFilterPriorityMedium((prev) => !prev)}/>Средний</label>
                                <label><Checkbox checked={filterPriorityLow} onChange={() => setFilterPriorityLow((prev) => !prev)}/>Низкий</label>

                                <div className={styles.onlyMyWrap}>
                                    <Switch checked={onlyMyTasks} onCheckedChange={setOnlyMyTasks} size="M"/>
                                    <span>Только мои задачи</span>
                                </div>
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
