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
import {Checkbox, Switch} from "antd";
import {Avatar} from "antd";
import {Calendar} from "antd";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import BoardColumnHeader from "@/pages/tasks/components/BoardColumnHeader";
import AddColumnButton from "@/pages/tasks/components/AddColumnButton";
import BoardTaskCard from "@/pages/tasks/components/board-task-card/BoardTaskCard";
import ProfileActionModal from "@/components/profile-action-modal/ProfileActionModal";
import {Button as AntButton} from "antd";
import {normalizeParticipantRole} from "@/utils/participantRole.ts";
import {useI18n} from "@/i18n/I18nProvider";
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
import type { GetEventBoardPayload, ParticipantRoleKind } from "@/types/api/Event.ts";
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

interface RawBoardTask {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  dueDate?: unknown;
  deadline?: unknown;
  assigneeDisplayName?: unknown;
  assigneeName?: unknown;
  assignedUserName?: unknown;
  assigneeAvatarUrl?: unknown;
  assigneeAvatar?: unknown;
  priority?: unknown;
  commentCount?: unknown;
  commentsCount?: unknown;
  comments?: unknown;
  assigneeId?: unknown;
  assignedUserId?: unknown;
}

interface RawBoardColumn {
  id?: unknown;
  name?: unknown;
  tasks?: unknown;
  boardTasks?: unknown;
}

interface RawBoardResponse {
  result?: unknown;
  columns?: unknown;
  boardColumns?: unknown;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toBoard = (
  payload: unknown,
  placeholders: {
    columnTitle: string;
    newTaskTitle: string;
    unassignedAssignee: string;
    defaultColumnStatus: string;
  },
): KanbanBoard<BoardCard> => {
  const payloadRec = asRecord(payload);
  const sourceRaw = (payloadRec.result ?? payload ?? {}) as unknown;
  const source = Array.isArray(sourceRaw)
    ? (sourceRaw[0] ?? {}) as unknown
    : sourceRaw;
  const sourceRec = asRecord(source) as unknown as RawBoardResponse;
  const columns = (sourceRec.columns ?? sourceRec.boardColumns ?? []) as unknown;

  return {
    columns: (Array.isArray(columns) ? columns : []).map(
      (column: unknown, columnIndex: number) => {
        const colRec = asRecord(column) as unknown as RawBoardColumn;
        const tasksRaw = (colRec.tasks ?? colRec.boardTasks ?? []) as unknown;
        const tasks = Array.isArray(tasksRaw) ? (tasksRaw as unknown[]) : [];

        return {
          id: String(colRec.id ?? `column-${columnIndex}`),
          title: String(colRec.name ?? placeholders.columnTitle),
          cards: tasks.map((task: unknown, taskIndex: number) => {
            const taskRec = asRecord(task) as unknown as RawBoardTask;
            const comments = Array.isArray(taskRec.comments)
              ? taskRec.comments
              : [];
            const priority = String(taskRec.priority ?? "");
            return {
              id: String(taskRec.id ?? `task-${taskIndex}`),
              taskId: String(taskRec.id ?? `task-${taskIndex}`),
              title: String(taskRec.title ?? placeholders.newTaskTitle),
              description: String(taskRec.description ?? ""),
              dueDate: (taskRec.dueDate ?? taskRec.deadline ?? undefined) as
                | string
                | undefined,
              assigneeName: String(
                taskRec.assigneeDisplayName ??
                  taskRec.assigneeName ??
                  taskRec.assignedUserName ??
                  placeholders.unassignedAssignee
              ),
              assigneeAvatar: String(
                taskRec.assigneeAvatarUrl ?? taskRec.assigneeAvatar ?? ""
              )
                ? String(taskRec.assigneeAvatarUrl ?? taskRec.assigneeAvatar)
                : undefined,
              priority:
                priority === "Urgent"
                  ? "Срочный"
                  : priority === "High"
                    ? "Высокий"
                    : priority === "Low"
                      ? "Низкий"
                      : "Средний",
              commentsCount: Number(
                taskRec.commentCount ?? taskRec.commentsCount ?? comments.length ?? 0
              ),
              status: String(colRec.name ?? placeholders.defaultColumnStatus),
              assigneeId: String(taskRec.assigneeId ?? taskRec.assignedUserId ?? "")
                ? String(taskRec.assigneeId ?? taskRec.assignedUserId)
                : undefined,
            };
          }),
        };
      }
    ),
  };
};

interface Props {
  eventId: string;
  participantRole?: ParticipantRoleKind | string | null;
  canManageTasks?: boolean;
}

export default function EventKanbanTab({ eventId, participantRole, canManageTasks }: Props) {
  const {t, language} = useI18n();
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
    if (participantRole) return participantRole;

    const users = subscribersData?.res?.users ?? [];
    return users.find((user) => user.id === currentUserId)?.role ?? null;
  }, [participantRole, subscribersData, currentUserId]);
  const canManageTask = useMemo(() => {
    if (typeof canManageTasks === "boolean") return canManageTasks;

    const role = normalizeParticipantRole(currentUserRole);
    return role === "Organizer" || role === "Editor";
  }, [canManageTasks, currentUserRole]);

  const hydratedBoard = useMemo(
    () =>
      toBoard(boardData, {
        columnTitle: t("eventPage.kanban.columnTitle"),
        newTaskTitle: t("eventPage.kanban.newTaskTitle"),
        unassignedAssignee: t("eventPage.kanban.unassignedAssignee"),
        defaultColumnStatus: t("eventPage.kanban.columnTitle"),
      }),
    [boardData, t],
  );
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
    if (!canManageTask) return;
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
    if (!canManageTask) return;
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
      ? t("eventPage.kanban.sort.urgentFirst")
      : mockSort === "newestFirst"
        ? t("eventPage.kanban.sort.newestFirst")
        : mockSort === "oldestFirst"
          ? t("eventPage.kanban.sort.oldestFirst")
          : t("eventPage.kanban.sort.assigneeAsc");

  const handleMoveCard = async (
    card: BoardCard,
    source?: { fromColumnId?: string | number; fromPosition: number },
    destination?: { toColumnId?: string | number; toPosition?: number }
  ) => {
    if (!source?.fromColumnId || !destination?.toColumnId) {
      await refetch();
      return;
    }
    if (typeof destination.toPosition !== "number") {
      await refetch();
      return;
    }
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
    const freshBoard = toBoard(refreshed.data, {
      columnTitle: t("eventPage.kanban.columnTitle"),
      newTaskTitle: t("eventPage.kanban.newTaskTitle"),
      unassignedAssignee: t("eventPage.kanban.unassignedAssignee"),
      defaultColumnStatus: t("eventPage.kanban.columnTitle"),
    });
    const newcomer = freshBoard.columns.find(
      (col) => !beforeIds.has(String(col.id))
    );
    if (newcomer) {
      setColumnIdAwaitingFirstName(String(newcomer.id));
      setColumnIdInlineRename(null);
    }
  };

  const handleDeleteColumn = (column: BoardColumn) => {
    if (!canManageTask) return;
    setColumnToDelete(column);
  };

  const handleCreateTaskGlobal = async () => {
    if (!canManageTask) return;
    setIsCreateTaskPanelOpen(true);
  };

  const handleSubmitTaskFromPanel = async () => {
    if (!canManageTask) return;
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
        window.alert(t("eventPage.kanban.createColumnFirstAlert"));
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
    if (!canManageTask) return;
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
    const usersRaw = (boardAssignees as unknown as { result?: unknown })?.result;
    const users = Array.isArray(usersRaw) ? (usersRaw as unknown[]) : [];
    return users
      .map((user) => {
        const rec = asRecord(user);
        const id = String(rec.id ?? "");
        if (!id) return null;
        const name = String(rec.name ?? rec.displayName ?? "").trim();
        return { id, name: name || t("eventPage.kanban.assignee") };
      })
      .filter(Boolean) as { id: string; name: string }[];
  }, [boardAssignees]);
  const selectedAssigneeName =
    assigneeOptions.find((user) => user.id === selectedAssigneeId)?.name ||
    t("eventPage.kanban.assignee");
  const selectedPriorityLabel =
    selectedPriority === "Urgent"
      ? t("eventPage.kanban.priorities.urgent")
      : selectedPriority === "High"
        ? t("eventPage.kanban.priorities.high")
      : selectedPriority === "Low"
          ? t("eventPage.kanban.priorities.low")
          : t("eventPage.kanban.priorities.medium");
  const deadlineLabel = taskDeadline
    ? new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(taskDeadline)
    : t("eventPage.kanban.deadline");

  return (
    <section className={styles.surface}>
      <div className={styles.controlsRow}>
        <div className={styles.leftControls}>
          <label className={styles.searchControl}>
            <SearchIcon />
            <input
              type="text"
                placeholder={t("eventPage.kanban.searchPlaceholder")}
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
              <span>{t("eventPage.kanban.filters")}</span>
              <ChevronDownIcon
                className={isFilterOpen ? styles.chevronUp : ""}
              />
            </button>

            {isFilterOpen && (
              <div className={styles.filterMenu}>
                <h4>{t("eventPage.kanban.deadline")}</h4>
                <label>
                  <Checkbox
                    checked={filterDeadlineOverdue}
                    className="ep-checkbox"
                    onChange={() => setFilterDeadlineOverdue((prev) => !prev)}
                  />
                  {t("eventPage.kanban.overdue")}
                </label>
                <label>
                  <Checkbox
                    checked={filterDeadlineToday}
                    className="ep-checkbox"
                    onChange={() => setFilterDeadlineToday((prev) => !prev)}
                  />
                  {t("eventPage.kanban.today")}
                </label>
                <label>
                  <Checkbox
                    checked={filterDeadlineTomorrow}
                    className="ep-checkbox"
                    onChange={() => setFilterDeadlineTomorrow((prev) => !prev)}
                  />
                  {t("eventPage.kanban.tomorrow")}
                </label>
                <label>
                  <Checkbox
                    checked={filterDeadlineThisWeek}
                    className="ep-checkbox"
                    onChange={() => setFilterDeadlineThisWeek((prev) => !prev)}
                  />
                  {t("eventPage.kanban.thisWeek")}
                </label>

                <h4>{t("eventPage.kanban.assignee")}</h4>
                {assigneeFacets.length === 0 ? (
                  <button type="button" className={styles.assigneeMock}>
                    <span>{t("eventPage.kanban.noAssignees")}</span>
                    <ChevronDownIcon className={styles.assigneeChevron} />
                  </button>
                ) : (
                  assigneeFacets.map((assignee) => (
                    <label key={assignee.id}>
                      <Checkbox
                        checked={selectedAssigneeIds.includes(assignee.id)}
                        className="ep-checkbox"
                        onChange={() =>
                          setSelectedAssigneeIds((prev) =>
                            prev.includes(assignee.id)
                              ? prev.filter((id) => id !== assignee.id)
                              : [...prev, assignee.id]
                          )
                        }
                      />
                      {assignee.displayName || t("eventPage.kanban.assignee")}
                    </label>
                  ))
                )}

                <h4>{t("eventPage.kanban.priority")}</h4>
                <label>
                  <Checkbox
                    checked={filterPriorityUrgent}
                    className="ep-checkbox"
                    onChange={() => setFilterPriorityUrgent((prev) => !prev)}
                  />
                  {t("eventPage.kanban.priorities.urgent")}
                </label>
                <label>
                  <Checkbox
                    checked={filterPriorityHigh}
                    className="ep-checkbox"
                    onChange={() => setFilterPriorityHigh((prev) => !prev)}
                  />
                  {t("eventPage.kanban.priorities.high")}
                </label>
                <label>
                  <Checkbox
                    checked={filterPriorityMedium}
                    className="ep-checkbox"
                    onChange={() => setFilterPriorityMedium((prev) => !prev)}
                  />
                  {t("eventPage.kanban.priorities.medium")}
                </label>
                <label>
                  <Checkbox
                    checked={filterPriorityLow}
                    className="ep-checkbox"
                    onChange={() => setFilterPriorityLow((prev) => !prev)}
                  />
                  {t("eventPage.kanban.priorities.low")}
                </label>

                <div className={styles.onlyMyWrap}>
                  <Switch
                    checked={onlyMyTasks}
                    onChange={setOnlyMyTasks}
                    className="ep-switch"
                  />
                  <span>{t("eventPage.kanban.onlyMyTasks")}</span>
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
                  <span>{t("eventPage.kanban.resetFilters")}</span>
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
                  {t("eventPage.kanban.sort.urgentFirst")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("newestFirst");
                    setIsSortOpen(false);
                  }}
                >
                  {t("eventPage.kanban.sort.newestFirst")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("oldestFirst");
                    setIsSortOpen(false);
                  }}
                >
                  {t("eventPage.kanban.sort.oldestFirst")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockSort("assigneeAsc");
                    setIsSortOpen(false);
                  }}
                >
                  {t("eventPage.kanban.sort.assigneeAsc")}
                </button>
              </div>
            )}
          </div>
          {canManageTask && (
            <AntButton
              type="primary"
              icon={<PlusIcon />}
              className="ep-btn ep-btn--s ep-btn--filled-green"
              onClick={handleCreateTaskGlobal}
            >
              {t("common.actions.createTask")}
            </AntButton>
          )}
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
                showActions={canManageTask}
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
        title={t("eventPage.kanban.delete.columnTitle", {
          title: columnToDelete?.title ?? "",
        })}
        description={t("eventPage.kanban.delete.columnDescription", {
          count: columnToDelete?.cards.length ?? 0,
        })}
        onClose={() => setColumnToDelete(null)}
        onConfirm={confirmDeleteColumn}
        confirmText={t("common.actions.delete")}
        cancelText={t("common.actions.cancel")}
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
                placeholder={
                  editingTask
                    ? t("eventPage.kanban.panel.titleEdit")
                    : t("eventPage.kanban.panel.titleCreate")
                }
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
              <h4>{t("eventPage.kanban.deadline")}</h4>
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
                    <Calendar
                      fullscreen={false}
                      value={taskDeadline ? dayjs(taskDeadline) : undefined}
                      onSelect={(value) => {
                        const date = value?.toDate();
                        setTaskDeadline(date);
                        if (date) setIsDeadlineOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.createTaskSection}>
              <h4>{t("eventPage.kanban.assignee")}</h4>
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
              <h4>{t("eventPage.kanban.priority")}</h4>
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
                      { key: "Urgent", label: t("eventPage.kanban.priorities.urgent") },
                      { key: "High", label: t("eventPage.kanban.priorities.high") },
                      { key: "Medium", label: t("eventPage.kanban.priorities.medium") },
                      { key: "Low", label: t("eventPage.kanban.priorities.low") },
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
                <h4>{t("eventPage.kanban.panel.description")}</h4>
                <span>{taskDescription.length}/200</span>
              </div>
              <textarea
                className={styles.createTaskDescription}
                value={taskDescription}
                onChange={(event) =>
                  setTaskDescription(event.target.value.slice(0, 200))
                }
                placeholder={t("eventPage.kanban.panel.description")}
              />
            </div>

            <div className={styles.createTaskActions}>
              <AntButton
                type="default"
                className="ep-btn ep-btn--s ep-btn--filled-gray"
                onClick={handleSubmitTaskFromPanel}
                disabled={!taskTitle.trim()}
              >
                {editingTask ? t("eventPage.kanban.panel.save") : t("eventPage.kanban.panel.create")}
              </AntButton>
              <AntButton
                type="text"
                className="ep-btn ep-btn--s ep-btn--text"
                onClick={() => setIsCreateTaskPanelOpen(false)}
              >
                {t("eventPage.kanban.panel.cancel")}
              </AntButton>
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
                          {t("eventPage.kanban.panel.titleEdit")}
                        </button>
                        <button
                          type="button"
                          className={styles.taskMenuDanger}
                          onClick={() => {
                            setTaskToDelete(selectedTask);
                            setIsTaskMenuOpen(false);
                          }}
                        >
                          {t("common.actions.delete")}
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
              <span>{t("eventPage.kanban.details.status")}</span>
              <strong>{selectedTask.status}</strong>
            </div>
            <div className={styles.taskMetaLine}>
              <FlagIcon className={styles.metaIcon} />
              <span>{t("eventPage.kanban.details.priority")}</span>
              <strong>
                {selectedTask.priority === "Срочный"
                  ? t("eventPage.kanban.priorities.urgent")
                  : selectedTask.priority === "Высокий"
                    ? t("eventPage.kanban.priorities.high")
                    : selectedTask.priority === "Низкий"
                      ? t("eventPage.kanban.priorities.low")
                      : t("eventPage.kanban.priorities.medium")}
              </strong>
            </div>
            <div className={styles.taskMetaLine}>
              <CalendarIcon className={styles.metaIcon} />
              <span>{t("eventPage.kanban.details.deadline")}</span>
              <strong>
                {selectedTask.dueDate
                  ? new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(selectedTask.dueDate))
                  : t("eventPage.kanban.noDeadline")}
              </strong>
            </div>
            <div className={styles.taskMetaLine}>
              <PersonIcon className={styles.metaIcon} />
              <span>{t("eventPage.kanban.details.assignee")}</span>
              <strong className={styles.assignee}>
                <Avatar
                  className="ep-avatar"
                  size={24}
                  src={selectedTask.assigneeAvatar}
                >
                  {(selectedTask.assigneeName?.[0] ?? "—").toUpperCase()}
                </Avatar>
                {selectedTask.assigneeName}
              </strong>
            </div>

            <div className={styles.taskDescription}>
              <div className={styles.taskDescriptionTitle}>
                <TextLeftIcon className={styles.metaIcon} />
                <span>{t("eventPage.kanban.details.description")}</span>
              </div>
              <p>{selectedTask.description || t("eventPage.kanban.noDescription")}</p>
            </div>

            <div className={styles.taskTabs}>
              <button
                type="button"
                className={activeTaskTab === "comments" ? styles.tabActive : ""}
                onClick={() => setActiveTaskTab("comments")}
              >
                {t("eventPage.kanban.details.tabs.comments")}
              </button>
              <button
                type="button"
                className={activeTaskTab === "history" ? styles.tabActive : ""}
                onClick={() => setActiveTaskTab("history")}
              >
                {t("eventPage.kanban.details.tabs.history")}
              </button>
            </div>

            <div className={styles.taskFeed}>
              {activeTaskTab === "comments"
                ? taskComments.map((comment) => (
                    <article key={comment.id} className={styles.feedItem}>
                      <div className={styles.feedHead}>
                        <strong>{comment.authorName || t("eventPage.kanban.details.userFallback")}</strong>
                        <span>
                          {comment.createdAt
                            ? new Intl.DateTimeFormat(
                              language === "ru" ? "ru-RU" : "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            ).format(new Date(comment.createdAt))
                            : ""}
                        </span>
                      </div>
                      <p>{comment.text}</p>
                    </article>
                  ))
                : taskHistory.map((item) => (
                    <article key={item.id} className={styles.feedItem}>
                      <div className={styles.feedHead}>
                        <strong>{item.authorName || t("eventPage.kanban.details.systemFallback")}</strong>
                        <span>
                          {item.createdAt
                            ? new Intl.DateTimeFormat(
                              language === "ru" ? "ru-RU" : "en-US",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            ).format(new Date(item.createdAt))
                            : ""}
                        </span>
                      </div>
                      <p>
                        {item.description || item.action || t("eventPage.kanban.details.taskChangeFallback")}
                      </p>
                    </article>
                  ))}
            </div>

            {activeTaskTab === "comments" && (
              <div className={styles.commentComposer}>
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder={t("eventPage.kanban.details.commentPlaceholder")}
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
        title={t("eventPage.kanban.delete.taskTitle", {
          title: taskToDelete?.title ?? "",
        })}
        description={t("eventPage.kanban.delete.taskDescription")}
        onClose={() => setTaskToDelete(null)}
        onConfirm={async () => {
          if (!taskToDelete) return;
          await deleteTask({ eventId, taskId: taskToDelete.taskId }).unwrap();
          setTaskToDelete(null);
          setSelectedTask(null);
          await refetch();
        }}
        confirmText={t("common.actions.delete")}
        cancelText={t("common.actions.cancel")}
        confirmTone="danger"
      />
    </section>
  );
}
