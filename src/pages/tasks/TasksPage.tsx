import Sidebar from '@/components/sidebar/Sidebar';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {ControlledBoard, moveCard, type KanbanBoard, type Card, type Column} from '@caldwell619/react-kanban';
import '@caldwell619/react-kanban/dist/styles.css';
import {
    useGetEventBoardQuery,
    useGetEventBoardFacetsQuery,
    useGetMyEventsQuery,
    useMoveBoardTaskMutation,
} from '@/services/api/eventApi.ts';
import type {GetEventBoardPayload} from '@/types/api/Event.ts';
import styles from './TasksPage.module.scss';
import BoardColumnHeader from './components/BoardColumnHeader';
import SearchIcon from '@/assets/img/icon-m/search.svg?react';
import FilterIcon from '@/assets/img/icon-m/filter.svg?react';
import ChevronDownIcon from '@/assets/img/icon-m/chevron-down.svg?react';
import type {RootState} from '@/store/store.ts';
import Checkbox from '@/ui/checkbox/Checkbox';
import Switch from '@/ui/switch/Switch';
import BoardTaskCard from '@/components/tasks/board-task-card/BoardTaskCard';

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
};

type BoardColumn = Column<BoardCard> & {
    id: string;
    title: string;
    cards: BoardCard[];
};

const isTaskAssignedToCurrentUser = (task: any, currentUserId: string): boolean => {
    if (!currentUserId) return true;

    const candidateIds = [
        task?.assignedUserId,
        task?.assigneeId,
        task?.assignedToUserId,
        task?.userId,
    ].filter(Boolean).map(String);

    if (!candidateIds.length) return true;
    return candidateIds.includes(String(currentUserId));
};

const toBoard = (payload: any, currentUserId: string, onlyMyTasks: boolean): KanbanBoard<BoardCard> => {
    const sourceRaw = payload?.result ?? payload ?? {};
    const source = Array.isArray(sourceRaw) ? (sourceRaw[0] ?? {}) : sourceRaw;
    const columns = source?.columns ?? source?.boardColumns ?? [];
    return {
        columns: (Array.isArray(columns) ? columns : []).map((column: any, columnIndex: number) => {
            const tasks = column?.tasks ?? column?.boardTasks ?? [];
            const myTasks = (Array.isArray(tasks) ? tasks : []).filter((task: any) => {
                if (!onlyMyTasks) return true;
                return isTaskAssignedToCurrentUser(task, currentUserId);
            });

            return {
                id: String(column?.id ?? `column-${columnIndex}`),
                title: String(column?.name ?? 'Колонка'),
                cards: myTasks.map((task: any, taskIndex: number) => ({
                    id: String(task?.id ?? `task-${taskIndex}`),
                    taskId: String(task?.id ?? `task-${taskIndex}`),
                    title: String(task?.title ?? 'Новая задача'),
                    description: String(task?.description ?? ''),
                    dueDate: task?.dueDate ?? task?.deadline ?? undefined,
                    assigneeName: String(task?.assigneeDisplayName ?? task?.assigneeName ?? task?.assignedUserName ?? 'Не назначено'),
                    assigneeAvatar: task?.assigneeAvatarUrl ?? task?.assigneeAvatar ?? undefined,
                    priority: task?.priority === 'Urgent' ? 'Срочный' : task?.priority === 'High' ? 'Высокий' : task?.priority === 'Low' ? 'Низкий' : 'Средний',
                    commentsCount: Number(task?.commentCount ?? task?.commentsCount ?? task?.comments?.length ?? (taskIndex % 4)),
                })),
            };
        }),
    };
};

export default function TasksPage() {
    const currentUserId = useSelector((state: RootState) => state.profile.profile?.id ?? '');
    const [searchParams] = useSearchParams();
    const requestedEventId = searchParams.get('eventId');
    const {data: myEventsData} = useGetMyEventsQuery();
    const eventId = requestedEventId || myEventsData?.result?.[0]?.id || '';

    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
    const [moveTask] = useMoveBoardTaskMutation();

    const [boardState, setBoardState] = useState<KanbanBoard<BoardCard>>({columns: []});
    const [searchValue, setSearchValue] = useState('');
    const [mockFilter, setMockFilter] = useState<'all' | 'withDueDate' | 'withoutDueDate'>('all');
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
    const [onlyMyTasks, setOnlyMyTasks] = useState(true);
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
            assigneeIds: selectedAssigneeIds.length ? selectedAssigneeIds.join(',') : undefined,
            priorities: priorities || undefined,
            mineOnly: onlyMyTasks || undefined,
            sort: mockSort === 'urgentFirst' ? 'UrgentFirst' : mockSort === 'newestFirst' ? 'Newest' : mockSort === 'oldestFirst' ? 'Oldest' : 'AssigneeAsc',
        };
    }, [eventId, searchValue, filterDeadlineOverdue, filterDeadlineToday, filterDeadlineTomorrow, filterDeadlineThisWeek, selectedAssigneeIds, filterPriorityUrgent, filterPriorityHigh, filterPriorityMedium, filterPriorityLow, onlyMyTasks, mockSort]);
    const {data: boardData, isLoading, refetch} = useGetEventBoardQuery(boardQueryParams, {
        skip: !eventId,
        refetchOnFocus: true,
        refetchOnReconnect: true,
        pollingInterval: 120000,
    });
    const {data: boardFacets} = useGetEventBoardFacetsQuery(eventId, {skip: !eventId});
    const sortRef = useRef<HTMLDivElement | null>(null);
    const filterRef = useRef<HTMLDivElement | null>(null);
    const hydratedBoard = useMemo(() => toBoard(boardData, currentUserId, onlyMyTasks), [boardData, currentUserId, onlyMyTasks]);

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

    const preparedBoard = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();

        return {
            columns: board.columns.map((column) => {
                let cards = [...column.cards];

                if (normalizedSearch) {
                    cards = cards.filter((card) => card.title.toLowerCase().includes(normalizedSearch));
                }

                if (mockFilter === 'withDueDate') {
                    cards = cards.filter((card) => Boolean(card.dueDate));
                }

                if (mockFilter === 'withoutDueDate') {
                    cards = cards.filter((card) => !card.dueDate);
                }

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
                    cards,
                };
            }),
        } as KanbanBoard<BoardCard>;
    }, [board, searchValue, mockFilter, mockSort, onlyMyTasks, filterDeadlineOverdue, filterDeadlineToday, filterDeadlineTomorrow, filterDeadlineThisWeek, filterPriorityUrgent, filterPriorityHigh, filterPriorityMedium, filterPriorityLow]);

    const sortLabel =
        mockSort === 'urgentFirst'
            ? 'Сначала срочные'
            : mockSort === 'newestFirst'
                ? 'Сначала новые'
                : mockSort === 'oldestFirst'
                    ? 'Сначала старые'
                    : 'Исполнитель: А -> Я';
    const assigneeFacets = Array.isArray(boardFacets?.result) ? boardFacets.result : [];

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

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebar}>
                <Sidebar notificationCount={5}/>
            </div>

            <div className={styles.content}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageHeaderTitle}>Мои задачи</h1>
                </div>

                {isLoading ? (
                    <p className={styles.subtitle}>Загружаем доску...</p>
                ) : !eventId ? (
                    <p className={styles.subtitle}>Нет мероприятия для отображения доски</p>
                ) : (
                    <section className={styles.boardSurface}>
                        <div className={styles.boardControls}>
                            <div className={styles.controlsLeft}>
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
                                                className={styles.resetFiltersBtn}
                                                onClick={() => {
                                                    setFilterDeadlineOverdue(false);
                                                    setFilterDeadlineToday(false);
                                                    setFilterDeadlineTomorrow(false);
                                                    setFilterDeadlineThisWeek(false);
                                                    setFilterPriorityUrgent(false);
                                                    setFilterPriorityHigh(false);
                                                    setFilterPriorityMedium(false);
                                                    setFilterPriorityLow(false);
                                                    setSelectedAssigneeIds([]);
                                                    setMockFilter('all');
                                                }}
                                            >
                                                Сбросить
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                        </div>

                        <div className={styles.boardLayout}>
                            <section className={styles.boardWrap}>
                            <ControlledBoard<BoardCard>
                                disableColumnDrag
                                renderCard={(card) => (
                                    <div className={styles.taskCard}>
                                        <BoardTaskCard
                                            title={card.title}
                                            description={card.description}
                                            dueDate={card.dueDate}
                                            assigneeName={card.assigneeName}
                                            assigneeAvatar={card.assigneeAvatar}
                                            priority={card.priority}
                                            commentsCount={card.commentsCount}
                                        />
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
                                            showActions={false}
                                        />
                                    );
                                }}
                                onCardDragEnd={handleMoveCard}
                            >
                                {preparedBoard}
                            </ControlledBoard>
                            </section>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
