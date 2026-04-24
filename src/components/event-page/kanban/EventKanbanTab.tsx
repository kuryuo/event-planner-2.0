import { useEffect, useMemo, useRef, useState } from "react";
import {
  ControlledBoard,
  moveCard,
  type Card,
  type Column,
  type KanbanBoard,
} from "@caldwell619/react-kanban";
import "@caldwell619/react-kanban/dist/styles.css";
import SearchIcon from "@/assets/img/icon-m/search.svg?react";
import FilterIcon from "@/assets/img/icon-m/filter.svg?react";
import ChevronDownIcon from "@/assets/img/icon-m/chevron-down.svg?react";
import PlusIcon from "@/assets/img/icon-s/plus-lg.svg?react";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg?react";
import PersonIcon from "@/assets/img/icon-m/person.svg?react";
import FlagIcon from "@/assets/image/flag.svg?react";
import XLgIcon from "@/assets/img/icon-m/x.svg?react";
import ThreeDotsVerticalIcon from "@/assets/img/icon-m/three-dots-vertical.svg?react";
import StatusIcon from "@/assets/image/status.svg?react";
import TextLeftIcon from "@/assets/image/text-left.svg?react";
import SendIcon from "@/assets/image/send.svg?react";
import FaceSmileIcon from "@/assets/image/face-smile.svg?react";
import Button from "@/ui/button/Button";
import Checkbox from "@/ui/checkbox/Checkbox";
import Switch from "@/ui/switch/Switch";
import Avatar from "@/ui/avatar/Avatar";
import { useSelector } from "react-redux";
import BoardColumnHeader from "@/pages/tasks/components/BoardColumnHeader";
import AddColumnButton from "@/pages/tasks/components/AddColumnButton";
import BoardTaskCard from "@/components/tasks/board-task-card/BoardTaskCard";
import ProfileActionModal from "@/components/profile-page/ProfileActionModal";
import { SingleDatePicker } from "@/ui/date-picker/SingleDatePicker";
import {
  useCreateBoardColumnMutation,
  useCreateBoardTaskMutation,
  useUpdateBoardTaskMutation,
  useDeleteBoardTaskMutation,
  useDeleteBoardColumnMutation,
  useGetEventBoardQuery,
  useGetEventBoardFacetsQuery,
  useGetEventBoardAssigneesQuery,
  useGetEventSubscribersQuery,
  useMoveBoardTaskMutation,
  useGetTaskCommentsQuery,
  useGetTaskHistoryQuery,
  useAddTaskCommentMutation,
  useUpdateBoardColumnMutation,
} from "@/services/api/eventApi.ts";
import type { GetEventBoardPayload } from "@/types/api/Event.ts";
import type { RootState } from "@/store/store";
import styles from "./EventKanbanTab.module.scss";

const BOARD_NEW_COLUMN_STUB_NAME = " ";

type BoardCard = Card & {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  assigneeName: string;
  assigneeAvatar?: string;
  priority: "Срочный" | "Высокий" | "Средний" | "Низкий";
  commentsCount: number;
  status: string;
  assigneeId?: string;
};

type BoardColumn = Column<BoardCard> & {
  id: string;
  title: string;
  cards: BoardCard[];
};

const toBoard = (payload: any): KanbanBoard<BoardCard> => {
  const sourceRaw = payload?.result ?? payload ?? {};
  const source = Array.isArray(sourceRaw) ? sourceRaw[0] ?? {} : sourceRaw;
  const columns = source?.columns ?? source?.boardColumns ?? [];

  return {
    columns: (Array.isArray(columns) ? columns : []).map(
      (column: any, columnIndex: number) => {
        const tasks = column?.tasks ?? column?.boardTasks ?? [];

        return {
          id: String(column?.id ?? `column-${columnIndex}`),
          title: String(column?.name ?? "Колонка"),
          cards: (Array.isArray(tasks) ? tasks : []).map(
            (task: any, taskIndex: number) => ({
              id: String(task?.id ?? `task-${taskIndex}`),
              taskId: String(task?.id ?? `task-${taskIndex}`),
              title: String(task?.title ?? "Новая задача"),
              description: String(task?.description ?? ""),
              dueDate: task?.dueDate ?? task?.deadline ?? undefined,
              assigneeName: String(
                task?.assigneeDisplayName ??
                  task?.assigneeName ??
                  task?.assignedUserName ??
                  "Не назначено"
              ),
              assigneeAvatar:
                task?.assigneeAvatarUrl ?? task?.assigneeAvatar ?? undefined,
              priority:
                task?.priority === "Urgent"
                  ? "Срочный"
                  : task?.priority === "High"
                  ? "Высокий"
                  : task?.priority === "Low"
                  ? "Низкий"
                  : "Средний",
              commentsCount: Number(
                task?.commentCount ??
                  task?.commentsCount ??
                  task?.comments?.length ??
                  0
              ),
              status: String(column?.name ?? "Запланировано"),
              assigneeId: task?.assigneeId ?? task?.assignedUserId ?? undefined,
            })
          ),
        };
      }
    ),
  };
};

interface Props {
  eventId: string;
}

export default function EventKanbanTab({ eventId }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const [mockSort, setMockSort] = useState<
    "urgentFirst" | "newestFirst" | "oldestFirst" | "assigneeAsc"
  >("urgentFirst");
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
      filterDeadlineOverdue && "Overdue",
      filterDeadlineToday && "Today",
      filterDeadlineTomorrow && "Tomorrow",
      filterDeadlineThisWeek && "ThisWeek",
    ]
      .filter(Boolean)
      .join(",");
    const priorities = [
      filterPriorityUrgent && "Urgent",
      filterPriorityHigh && "High",
      filterPriorityMedium && "Medium",
      filterPriorityLow && "Low",
    ]
      .filter(Boolean)
      .join(",");
    return {
      eventId,
      q: searchValue.trim() || undefined,
      deadlines: deadlines || undefined,
      priorities: priorities || undefined,
      assigneeIds: selectedAssigneeIds.length
        ? selectedAssigneeIds.join(",")
        : undefined,
      mineOnly: onlyMyTasks || undefined,
      sort:
        mockSort === "urgentFirst"
          ? "UrgentFirst"
          : mockSort === "newestFirst"
          ? "Newest"
          : mockSort === "oldestFirst"
          ? "Oldest"
          : "AssigneeAsc",
    };
  }, [
    eventId,
    searchValue,
    filterDeadlineOverdue,
    filterDeadlineToday,
    filterDeadlineTomorrow,
    filterDeadlineThisWeek,
    filterPriorityUrgent,
    filterPriorityHigh,
    filterPriorityMedium,
    filterPriorityLow,
    selectedAssigneeIds,
    onlyMyTasks,
    mockSort,
  ]);

  const { data: boardData, refetch } = useGetEventBoardQuery(boardQueryParams, {
    skip: !eventId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 120000,
  });
  const { data: boardFacets } = useGetEventBoardFacetsQuery(eventId, {
    skip: !eventId,
  });
  const { data: boardAssignees } = useGetEventBoardAssigneesQuery(eventId, {
    skip: !eventId,
  });
  const { data: subscribersData } = useGetEventSubscribersQuery(
    { eventId, count: 200, offset: 0 },
    { skip: !eventId }
  );
  const [moveTask] = useMoveBoardTaskMutation();
  const [createColumn] = useCreateBoardColumnMutation();
  const [updateColumn] = useUpdateBoardColumnMutation();
  const [deleteColumn] = useDeleteBoardColumnMutation();
  const [createTask] = useCreateBoardTaskMutation();
  const [updateTask] = useUpdateBoardTaskMutation();
  const [deleteTask] = useDeleteBoardTaskMutation();
  const currentUserId = useSelector(
    (state: RootState) => state.profile.profile?.id ?? ""
  );
  const currentUserRole = useMemo(() => {
    const users = subscribersData?.res?.users ?? [];
    return users.find((user) => user.id === currentUserId)?.role ?? null;
  }, [subscribersData, currentUserId]);
  const normalizedRole = String(currentUserRole ?? "").toLowerCase();
  const canManageTask =
    !currentUserRole ||
    normalizedRole === "organizer" ||
    normalizedRole === "editor" ||
    normalizedRole === "организатор" ||
    normalizedRole === "редактор";

  const hydratedBoard = useMemo(() => toBoard(boardData), [boardData]);
  const [boardState, setBoardState] = useState<KanbanBoard<BoardCard>>({
    columns: [],
  });
  const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(
    null
  );
  const [columnIdAwaitingFirstName, setColumnIdAwaitingFirstName] = useState<
    string | null
  >(null);
  const [columnIdInlineRename, setColumnIdInlineRename] = useState<
    string | null
  >(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateTaskPanelOpen, setIsCreateTaskPanelOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState<Date | undefined>(undefined);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<
    "Urgent" | "High" | "Medium" | "Low"
  >("Medium");
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardCard | null>(null);
  const [editingTask, setEditingTask] = useState<BoardCard | null>(null);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<BoardCard | null>(null);
  const [activeTaskTab, setActiveTaskTab] = useState<"comments" | "history">(
    "comments"
  );
  const [commentText, setCommentText] = useState("");
  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const assigneeRef = useRef<HTMLDivElement | null>(null);
  const priorityRef = useRef<HTMLDivElement | null>(null);
  const deadlineRef = useRef<HTMLDivElement | null>(null);
  const taskMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: taskComments = [] } = useGetTaskCommentsQuery(
    { eventId, taskId: selectedTask?.taskId ?? "" },
    { skip: !eventId || !selectedTask }
  );
  const { data: taskHistory = [] } = useGetTaskHistoryQuery(
    { eventId, taskId: selectedTask?.taskId ?? "" },
    { skip: !eventId || !selectedTask }
  );
  const [addTaskComment] = useAddTaskCommentMutation();

  useEffect(() => {
    setBoardState(hydratedBoard);
  }, [hydratedBoard]);

  useEffect(() => {
    const columnIds = new Set(
      hydratedBoard.columns.map((col) => String(col.id))
    );
    if (
      columnIdAwaitingFirstName &&
      !columnIds.has(columnIdAwaitingFirstName)
    ) {
      setColumnIdAwaitingFirstName(null);
    }
    if (columnIdInlineRename && !columnIds.has(columnIdInlineRename)) {
      setColumnIdInlineRename(null);
    }
  }, [hydratedBoard, columnIdAwaitingFirstName, columnIdInlineRename]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sortRef.current && !sortRef.current.contains(target))
        setIsSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(target))
        setIsFilterOpen(false);
      if (assigneeRef.current && !assigneeRef.current.contains(target))
        setIsAssigneeOpen(false);
      if (priorityRef.current && !priorityRef.current.contains(target))
        setIsPriorityOpen(false);
      if (deadlineRef.current && !deadlineRef.current.contains(target))
        setIsDeadlineOpen(false);
      if (taskMenuRef.current && !taskMenuRef.current.contains(target))
        setIsTaskMenuOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const board = boardState.columns.length ? boardState : hydratedBoard;

  const cancelPendingNewColumn = async (columnId: string) => {
    if (columnIdAwaitingFirstName !== columnId) return;
    setColumnIdAwaitingFirstName(null);
    try {
      await deleteColumn({ eventId, columnId }).unwrap();
      await refetch();
    } catch {
      await refetch();
    }
  };

  const commitColumnTitle = async (columnId: string, draft: string) => {
    const trimmed = draft.trim();
    const awaitingFirst = columnIdAwaitingFirstName === columnId;
    const renaming = columnIdInlineRename === columnId;

    if (awaitingFirst && !trimmed) {
      await cancelPendingNewColumn(columnId);
      return;
    }

    if (renaming && !trimmed) {
      setColumnIdInlineRename(null);
      return;
    }

    const previousTitle =
      board.columns.find((col) => String(col.id) === columnId)?.title ?? "";
    if (renaming && trimmed === previousTitle.trim()) {
      setColumnIdInlineRename(null);
      return;
    }

    try {
      await updateColumn({ eventId, columnId, name: trimmed }).unwrap();
      setColumnIdAwaitingFirstName((prev) => (prev === columnId ? null : prev));
      setColumnIdInlineRename((prev) => (prev === columnId ? null : prev));
      await refetch();
    } catch {
      await refetch();
    }
  };

  const preparedBoard = useMemo(() => ({ columns: board.columns }), [board]);

  const sortLabel =
    mockSort === "urgentFirst"
      ? "Сначала срочные"
      : mockSort === "newestFirst"
      ? "Сначала новые"
      : mockSort === "oldestFirst"
      ? "Сначала старые"
      : "Исполнитель: А -> Я";

  const handleMoveCard = async (
    card: BoardCard,
    source: any,
    destination: any
  ) => {
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
    if (!canManageTask) return;
    const beforeIds = new Set(board.columns.map((col) => String(col.id)));
    try {
      await createColumn({
        eventId,
        name: BOARD_NEW_COLUMN_STUB_NAME,
      }).unwrap();
    } catch {
      return;
    }
    const refreshed = await refetch();
    const freshBoard = toBoard(refreshed.data);
    const newcomer = freshBoard.columns.find(
      (col) => !beforeIds.has(String(col.id))
    );
    if (newcomer) {
      setColumnIdAwaitingFirstName(String(newcomer.id));
      setColumnIdInlineRename(null);
    }
  };

  const handleDeleteColumn = (column: BoardColumn) => {
    setColumnToDelete(column);
  };

  const handleCreateTaskGlobal = async () => {
    setIsCreateTaskPanelOpen(true);
  };

  const handleSubmitTaskFromPanel = async () => {
    if (!taskTitle.trim()) return;

    if (editingTask) {
      await updateTask({
        eventId,
        taskId: editingTask.taskId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        assigneeId: selectedAssigneeId || undefined,
        deadline: taskDeadline?.toISOString(),
        priority: selectedPriority,
      }).unwrap();
    } else {
      const firstColumnId = board.columns[0]?.id;
      if (!firstColumnId) {
        window.alert("Сначала создайте колонку");
        return;
      }
      await createTask({
        eventId,
        columnId: String(firstColumnId),
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        assignedUserId: selectedAssigneeId || undefined,
        dueDate: taskDeadline?.toISOString(),
        priority: selectedPriority,
      }).unwrap();
    }
    setIsCreateTaskPanelOpen(false);
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline(undefined);
    setSelectedAssigneeId("");
    setSelectedPriority("Medium");
    await refetch();
  };

  const handleSendComment = async () => {
    if (!selectedTask || !commentText.trim()) return;
    await addTaskComment({
      eventId,
      taskId: selectedTask.taskId,
      text: commentText.trim(),
    }).unwrap();
    setCommentText("");
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;
    const deletedId = String(columnToDelete.id);
    await deleteColumn({ eventId, columnId: deletedId }).unwrap();
    setColumnToDelete(null);
    setColumnIdAwaitingFirstName((prev) => (prev === deletedId ? null : prev));
    setColumnIdInlineRename((prev) => (prev === deletedId ? null : prev));
    await refetch();
  };

  const assigneeFacets = useMemo(
    () =>
      Array.isArray(boardFacets?.result)
        ? boardFacets.result
        : Array.isArray(boardFacets?.assignees)
        ? boardFacets.assignees
        : [],
    [boardFacets]
  );
  const assigneeOptions = useMemo(() => {
    const users = boardAssignees?.result ?? [];
    return users.map((user: any) => ({
      id: user.id,
      name: user.name || user.displayName || "Участник",
    }));
  }, [boardAssignees]);
  const selectedAssigneeName =
    assigneeOptions.find((user) => user.id === selectedAssigneeId)?.name ||
    "Исполнитель";
  const selectedPriorityLabel =
    selectedPriority === "Urgent"
      ? "Срочный"
      : selectedPriority === "High"
      ? "Высокий"
      : selectedPriority === "Low"
      ? "Низкий"
      : "Средний";
  const deadlineLabel = taskDeadline
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(taskDeadline)
    : "Дедлайн";

  return (
    <section className={styles.surface}>
      <div className={styles.controlsRow}>
        <div className={styles.leftControls}>
          <label className={styles.searchControl}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Задача..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>
          <div className={styles.controlDropdown} ref={filterRef}>
            <button
              type="button"
              className={styles.filterControl}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <FilterIcon />
              <span>Фильтры</span>
              <ChevronDownIcon
                className={isFilterOpen ? styles.chevronUp : ""}
              />
            </button>

            {isFilterOpen && (
              <div className={styles.filterMenu}>
                <h4>Дедлайн</h4>
                <label>
                  <Checkbox
                    checked={filterDeadlineOverdue}
                    onChange={() => setFilterDeadlineOverdue((prev) => !prev)}
                  />
                  Просрочен
                </label>
                <label>
                  <Checkbox
                    checked={filterDeadlineToday}
                    onChange={() => setFilterDeadlineToday((prev) => !prev)}
                  />
                  Сегодня
                </label>
                <label>
                  <Checkbox
                    checked={filterDeadlineTomorrow}
                    onChange={() => setFilterDeadlineTomorrow((prev) => !prev)}
                  />
                  Завтра
                </label>
                <label>
                  <Checkbox
                    checked={filterDeadlineThisWeek}
                    onChange={() => setFilterDeadlineThisWeek((prev) => !prev)}
                  />
                  На этой неделе
                </label>

                <h4>Исполнитель</h4>
                {assigneeFacets.length === 0 ? (
                  <button type="button" className={styles.assigneeMock}>
                    <span>Нет исполнителей</span>
                    <ChevronDownIcon className={styles.assigneeChevron} />
                  </button>
                ) : (
                  assigneeFacets.map((assignee) => (
                    <label key={assignee.id}>
                      <Checkbox
                        checked={selectedAssigneeIds.includes(assignee.id)}
                        onChange={() =>
                          setSelectedAssigneeIds((prev) =>
                            prev.includes(assignee.id)
                              ? prev.filter((id) => id !== assignee.id)
                              : [...prev, assignee.id]
                          )
                        }
                      />
                      {assignee.displayName || "Участник"}
                    </label>
                  ))
                )}

                <h4>Приоритет</h4>
                <label>
                  <Checkbox
                    checked={filterPriorityUrgent}
                    onChange={() => setFilterPriorityUrgent((prev) => !prev)}
                  />
                  Срочный
                </label>
                <label>
                  <Checkbox
                    checked={filterPriorityHigh}
                    onChange={() => setFilterPriorityHigh((prev) => !prev)}
                  />
                  Высокий
                </label>
                <label>
                  <Checkbox
                    checked={filterPriorityMedium}
                    onChange={() => setFilterPriorityMedium((prev) => !prev)}
                  />
                  Средний
                </label>
                <label>
                  <Checkbox
                    checked={filterPriorityLow}
                    onChange={() => setFilterPriorityLow((prev) => !prev)}
                  />
                  Низкий
                </label>

                <div className={styles.onlyMyWrap}>
                  <Switch
                    checked={onlyMyTasks}
                    onCheckedChange={setOnlyMyTasks}
                    size="M"
                  />
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
                    setSearchValue("");
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
            <button
              type="button"
              className={styles.sortControl}
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              <ChevronDownIcon className={styles.sortIcon} />
              <span>{sortLabel}</span>
            </button>

            {isSortOpen && (
              <div className={styles.sortMenu}>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("urgentFirst");
                    setIsSortOpen(false);
                  }}
                >
                  Сначала срочные
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("newestFirst");
                    setIsSortOpen(false);
                  }}
                >
                  Сначала новые
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("oldestFirst");
                    setIsSortOpen(false);
                  }}
                >
                  Сначала старые
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("assigneeAsc");
                    setIsSortOpen(false);
                  }}
                >
                  Исполнитель: А -&gt; Я
                </button>
              </div>
            )}
          </div>
          <Button
            size="S"
            variant="Filled"
            color="green"
            leftIcon={<PlusIcon />}
            onClick={handleCreateTaskGlobal}
          >
            Создать задачу
          </Button>
        </div>
      </div>

      <div className={styles.boardWrap}>
        <ControlledBoard<BoardCard>
          disableColumnDrag
          renderCard={(card) => (
            <div
              className={styles.taskCard}
              onClick={() => setSelectedTask(card as BoardCard)}
            >
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
            const columnId = String(boardColumn.id);
            const columnIndex = board.columns.findIndex(
              (item) => String(item.id) === columnId
            );
            const inlineTitleMode =
              columnIdAwaitingFirstName === columnId
                ? "initial"
                : columnIdInlineRename === columnId
                ? "rename"
                : "none";

            return (
              <BoardColumnHeader
                title={boardColumn.title}
                count={boardColumn.cards.length}
                colorIndex={columnIndex >= 0 ? columnIndex : 0}
                showActions
                inlineTitleMode={inlineTitleMode}
                canEditTitleInline={canManageTask}
                onCommitInlineTitle={(name) =>
                  void commitColumnTitle(columnId, name)
                }
                onCancelInlineRename={() => {
                  if (columnIdInlineRename === columnId) {
                    setColumnIdInlineRename(null);
                  }
                }}
                onCancelInitialColumnCreate={() =>
                  void cancelPendingNewColumn(columnId)
                }
                onRenameColumn={() => {
                  if (!canManageTask) return;
                  if (columnIdAwaitingFirstName === columnId) return;
                  setColumnIdInlineRename(columnId);
                }}
                onDeleteColumn={() => handleDeleteColumn(boardColumn)}
              />
            );
          }}
          onCardDragEnd={handleMoveCard}
        >
          {preparedBoard}
        </ControlledBoard>

        <div className={styles.addColumnFloating}>
          <AddColumnButton
            onClick={handleCreateColumn}
            disabled={!canManageTask}
          />
        </div>
      </div>

      <ProfileActionModal
        isOpen={Boolean(columnToDelete)}
        title={`Удалить колонку «${columnToDelete?.title ?? ""}»?`}
        description={`Все вложенные задачи (${
          columnToDelete?.cards.length ?? 0
        }) также будут безвозвратно удалены`}
        onClose={() => setColumnToDelete(null)}
        onConfirm={confirmDeleteColumn}
        confirmText="Удалить"
        cancelText="Отменить"
        confirmTone="danger"
      />

      {isCreateTaskPanelOpen && (
        <>
          <button
            type="button"
            className={styles.createTaskBackdrop}
            onClick={() => setIsCreateTaskPanelOpen(false)}
          />
          <aside className={styles.createTaskPanel}>
            <div className={styles.createTaskHeader}>
              <input
                className={styles.createTaskTitle}
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder={editingTask ? "Редактирование задачи" : "Название"}
              />
              <button
                type="button"
                className={styles.createTaskClose}
                onClick={() => setIsCreateTaskPanelOpen(false)}
              >
                <XLgIcon />
              </button>
            </div>

            <div className={styles.createTaskSection}>
              <h4>Дедлайн</h4>
              <div className={styles.dropdownWrap} ref={deadlineRef}>
                <button
                  type="button"
                  className={styles.createTaskField}
                  onClick={() => setIsDeadlineOpen((prev) => !prev)}
                >
                  <CalendarIcon />
                  <span>{deadlineLabel}</span>
                </button>
                {isDeadlineOpen && (
                  <div
                    className={`${styles.createTaskMenu} ${styles.createTaskCalendarMenu}`}
                  >
                    <SingleDatePicker
                      initialDate={taskDeadline}
                      onDateChange={(date) => {
                        setTaskDeadline(date);
                        if (date) setIsDeadlineOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.createTaskSection}>
              <h4>Исполнитель</h4>
              <div className={styles.dropdownWrap} ref={assigneeRef}>
                <button
                  type="button"
                  className={styles.createTaskField}
                  onClick={() => setIsAssigneeOpen((prev) => !prev)}
                >
                  <PersonIcon />
                  <span>{selectedAssigneeName}</span>
                  <ChevronDownIcon className={styles.fieldChevron} />
                </button>
                {isAssigneeOpen && (
                  <div className={styles.createTaskMenu}>
                    {assigneeOptions.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className={styles.createTaskMenuItem}
                        onClick={() => {
                          setSelectedAssigneeId(user.id);
                          setIsAssigneeOpen(false);
                        }}
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.createTaskSection}>
              <h4>Приоритет</h4>
              <div className={styles.dropdownWrap} ref={priorityRef}>
                <button
                  type="button"
                  className={styles.createTaskField}
                  onClick={() => setIsPriorityOpen((prev) => !prev)}
                >
                  <FlagIcon />
                  <span>{selectedPriorityLabel}</span>
                  <ChevronDownIcon className={styles.fieldChevron} />
                </button>
                {isPriorityOpen && (
                  <div className={styles.createTaskMenu}>
                    {[
                      { key: "Urgent", label: "Срочный" },
                      { key: "High", label: "Высокий" },
                      { key: "Medium", label: "Средний" },
                      { key: "Low", label: "Низкий" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={styles.createTaskMenuItem}
                        onClick={() => {
                          setSelectedPriority(
                            item.key as "Urgent" | "High" | "Medium" | "Low"
                          );
                          setIsPriorityOpen(false);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.createTaskSection}>
              <div className={styles.descriptionHead}>
                <h4>Описание</h4>
                <span>{taskDescription.length}/200</span>
              </div>
              <textarea
                className={styles.createTaskDescription}
                value={taskDescription}
                onChange={(event) =>
                  setTaskDescription(event.target.value.slice(0, 200))
                }
                placeholder="Описание"
              />
            </div>

            <div className={styles.createTaskActions}>
              <Button
                variant="Filled"
                color="gray"
                size="S"
                onClick={handleSubmitTaskFromPanel}
                disabled={!taskTitle.trim()}
              >
                {editingTask ? "Сохранить" : "Создать"}
              </Button>
              <Button
                variant="Text"
                color="default"
                size="S"
                onClick={() => setIsCreateTaskPanelOpen(false)}
              >
                Отменить
              </Button>
            </div>
          </aside>
        </>
      )}

      {selectedTask && (
        <>
          <button
            type="button"
            className={styles.createTaskBackdrop}
            onClick={() => setSelectedTask(null)}
          />
          <aside className={styles.createTaskPanel}>
            <div className={styles.taskViewHeader}>
              <h3>{selectedTask.title}</h3>
              <div className={styles.taskViewActions}>
                {canManageTask && (
                  <div className={styles.taskMenuWrap} ref={taskMenuRef}>
                    <button
                      type="button"
                      className={styles.createTaskClose}
                      onClick={() => setIsTaskMenuOpen((prev) => !prev)}
                    >
                      <ThreeDotsVerticalIcon />
                    </button>
                    {isTaskMenuOpen && (
                      <div className={styles.taskMenuDropdown}>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskTitle(selectedTask.title);
                            setTaskDescription(selectedTask.description || "");
                            setTaskDeadline(
                              selectedTask.dueDate
                                ? new Date(selectedTask.dueDate)
                                : undefined
                            );
                            setSelectedAssigneeId(
                              selectedTask.assigneeId || ""
                            );
                            setSelectedPriority(
                              selectedTask.priority === "Срочный"
                                ? "Urgent"
                                : selectedTask.priority === "Высокий"
                                ? "High"
                                : selectedTask.priority === "Низкий"
                                ? "Low"
                                : "Medium"
                            );
                            setEditingTask(selectedTask);
                            setIsTaskMenuOpen(false);
                            setSelectedTask(null);
                            setIsCreateTaskPanelOpen(true);
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className={styles.taskMenuDanger}
                          onClick={() => {
                            setTaskToDelete(selectedTask);
                            setIsTaskMenuOpen(false);
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  className={styles.createTaskClose}
                  onClick={() => setSelectedTask(null)}
                >
                  <XLgIcon />
                </button>
              </div>
            </div>

            <div className={styles.taskMetaLine}>
              <StatusIcon className={styles.metaIcon} />
              <span>Статус</span>
              <strong>{selectedTask.status}</strong>
            </div>
            <div className={styles.taskMetaLine}>
              <FlagIcon className={styles.metaIcon} />
              <span>Приоритет</span>
              <strong>{selectedTask.priority}</strong>
            </div>
            <div className={styles.taskMetaLine}>
              <CalendarIcon className={styles.metaIcon} />
              <span>Дедлайн</span>
              <strong>
                {selectedTask.dueDate
                  ? new Intl.DateTimeFormat("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(selectedTask.dueDate))
                  : "Без срока"}
              </strong>
            </div>
            <div className={styles.taskMetaLine}>
              <PersonIcon className={styles.metaIcon} />
              <span>Исполнитель</span>
              <strong className={styles.assignee}>
                <Avatar
                  size="XS"
                  avatarUrl={selectedTask.assigneeAvatar}
                  name={selectedTask.assigneeName}
                />
                {selectedTask.assigneeName}
              </strong>
            </div>

            <div className={styles.taskDescription}>
              <div className={styles.taskDescriptionTitle}>
                <TextLeftIcon className={styles.metaIcon} />
                <span>Описание</span>
              </div>
              <p>{selectedTask.description || "Описание отсутствует"}</p>
            </div>

            <div className={styles.taskTabs}>
              <button
                type="button"
                className={activeTaskTab === "comments" ? styles.tabActive : ""}
                onClick={() => setActiveTaskTab("comments")}
              >
                Комментарии
              </button>
              <button
                type="button"
                className={activeTaskTab === "history" ? styles.tabActive : ""}
                onClick={() => setActiveTaskTab("history")}
              >
                История
              </button>
            </div>

            <div className={styles.taskFeed}>
              {activeTaskTab === "comments"
                ? taskComments.map((comment) => (
                    <article key={comment.id} className={styles.feedItem}>
                      <div className={styles.feedHead}>
                        <strong>{comment.authorName || "Пользователь"}</strong>
                        <span>
                          {comment.createdAt
                            ? new Intl.DateTimeFormat("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(comment.createdAt))
                            : ""}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                    </article>
                  ))
                : taskHistory.map((item) => (
                    <article key={item.id} className={styles.feedItem}>
                      <div className={styles.feedHead}>
                        <strong>{item.authorName || "Система"}</strong>
                        <span>
                          {item.createdAt
                            ? new Intl.DateTimeFormat("ru-RU", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(item.createdAt))
                            : ""}
                        </span>
                      </div>
                      <p>
                        {item.description || item.action || "Изменение задачи"}
                      </p>
                    </article>
                  ))}
            </div>

            {activeTaskTab === "comments" && (
              <div className={styles.commentComposer}>
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Комментарий..."
                />
                <button type="button">
                  <FaceSmileIcon />
                </button>
                <button type="button" onClick={() => void handleSendComment()}>
                  <SendIcon />
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      <ProfileActionModal
        isOpen={Boolean(taskToDelete)}
        title={`Удалить задачу «${taskToDelete?.title ?? ""}»?`}
        description="Задача будет безвозвратно удалена"
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (!taskToDelete) return;
          await deleteTask({ eventId, taskId: taskToDelete.taskId }).unwrap();
          setTaskToDelete(null);
          setSelectedTask(null);
          await refetch();
        }}
        confirmText="Удалить"
        cancelText="Отменить"
        confirmTone="danger"
      />
    </section>
  );
}
