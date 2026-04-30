import Sidebar from "@/components/sidebar/Sidebar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  ControlledBoard,
  moveCard,
  type KanbanBoard,
  type Card,
  type Column,
} from "@caldwell619/react-kanban";
import "@caldwell619/react-kanban/dist/styles.css";
import { useGetMyAssignedTasksQuery } from "@/services/api/eventApi.ts";
import type { MyAssignedTaskItem } from "@/types/api/Event.ts";
import styles from "./TasksPage.module.scss";
import BoardColumnHeader from "./components/BoardColumnHeader";
import SearchIcon from "@/assets/img/icon-m/search.svg?react";
import FilterIcon from "@/assets/img/icon-m/filter.svg?react";
import ChevronDownIcon from "@/assets/img/icon-m/chevron-down.svg?react";
import CalendarIcon from "@/assets/img/icon-m/calendar.svg?react";
import PersonIcon from "@/assets/img/icon-m/person.svg?react";
import FlagIcon from "@/assets/image/flag.svg?react";
import StatusIcon from "@/assets/image/status.svg?react";
import TextLeftIcon from "@/assets/image/text-left.svg?react";
import SendIcon from "@/assets/image/send.svg?react";
import FaceSmileIcon from "@/assets/image/face-smile.svg?react";
import XLgIcon from "@/assets/img/icon-m/x.svg?react";
import type { RootState } from "@/store/store.ts";
import {Checkbox, Switch} from "antd";
import BoardTaskCard from "@/pages/tasks/components/board-task-card/BoardTaskCard";
import { buildImageUrl } from "@/utils/buildImageUrl.ts";
import {Avatar} from "antd";
import {
  useGetTaskCommentsQuery,
  useGetTaskHistoryQuery,
  useAddTaskCommentMutation,
} from "@/services/api/eventApi.ts";

type BoardCard = Card & {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  dueDate?: string;
  assigneeName: string;
  assigneeAvatar?: string;
  assigneeId?: string;
  priority: "Срочный" | "Высокий" | "Средний" | "Низкий";
  commentsCount: number;
  eventId: string;
  eventName?: string;
  status: string;
};

type BoardColumn = Column<BoardCard> & {
  id: string;
  title: string;
  cards: BoardCard[];
};

const isTaskAssignedToCurrentUser = (
  task: any,
  currentUserId: string
): boolean => {
  if (!currentUserId) return true;

  const candidateIds = [
    task?.assignedUserId,
    task?.assigneeId,
    task?.assignedToUserId,
    task?.userId,
  ]
    .filter(Boolean)
    .map(String);

  if (!candidateIds.length) return true;
  return candidateIds.includes(String(currentUserId));
};

const toBoard = (
  tasks: MyAssignedTaskItem[],
  currentUserId: string,
  onlyMyTasks: boolean
): KanbanBoard<BoardCard> => {
  const filtered = (tasks ?? []).filter((task) => {
    if (!onlyMyTasks) return true;
    return isTaskAssignedToCurrentUser(task, currentUserId);
  });

  const byStatus = new Map<string, MyAssignedTaskItem[]>();
  filtered.forEach((task) => {
    const status = task.status?.trim() || "Без статуса";
    const bucket = byStatus.get(status) ?? [];
    bucket.push(task);
    byStatus.set(status, bucket);
  });

  return {
    columns: Array.from(byStatus.entries()).map(
      ([status, items], columnIndex) => ({
        id: `status-${columnIndex}`,
        title: status,
        cards: items.map((task, taskIndex) => ({
          id: String(task.id ?? `task-${taskIndex}`),
          taskId: String(task.id ?? `task-${taskIndex}`),
          title: String(task.title ?? "Новая задача"),
          description: String(task.description ?? ""),
          dueDate: task.dueDate ?? undefined,
          assigneeName: String(task.eventName ?? "Мероприятие"),
          assigneeAvatar: buildImageUrl(task.eventAvatarUrl) ?? undefined,
          assigneeId: task.assignedUserId ?? undefined,
          priority:
            task.priority === "Urgent"
              ? "Срочный"
              : task.priority === "High"
              ? "Высокий"
              : task.priority === "Low"
              ? "Низкий"
              : "Средний",
          commentsCount: 0,
          eventId: task.eventId,
          eventName: task.eventName ?? undefined,
          status,
        })),
      })
    ),
  };
};

export default function TasksPage() {
  const currentUserId = useSelector(
    (state: RootState) => state.profile.profile?.id ?? ""
  );

  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [boardState, setBoardState] = useState<KanbanBoard<BoardCard>>({
    columns: [],
  });
  const [searchValue, setSearchValue] = useState("");
  const [mockFilter, setMockFilter] = useState<
    "all" | "withDueDate" | "withoutDueDate"
  >("all");
  const [mockSort, setMockSort] = useState<
    "urgentFirst" | "newestFirst" | "oldestFirst" | "assigneeAsc"
  >("urgentFirst");
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
  const [selectedTask, setSelectedTask] = useState<BoardCard | null>(null);
  const [activeTaskTab, setActiveTaskTab] = useState<"comments" | "history">(
    "comments"
  );
  const [commentText, setCommentText] = useState("");
  const { data: myTasksData = [], isLoading } = useGetMyAssignedTasksQuery(
    undefined,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 120000,
    }
  );
  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const { data: taskComments = [] } = useGetTaskCommentsQuery(
    {
      eventId: selectedTask?.eventId ?? "",
      taskId: selectedTask?.taskId ?? "",
    },
    { skip: !selectedTask }
  );
  const { data: taskHistory = [] } = useGetTaskHistoryQuery(
    {
      eventId: selectedTask?.eventId ?? "",
      taskId: selectedTask?.taskId ?? "",
    },
    { skip: !selectedTask }
  );
  const [addTaskComment] = useAddTaskCommentMutation();
  const hydratedBoard = useMemo(
    () => toBoard(myTasksData, currentUserId, onlyMyTasks),
    [myTasksData, currentUserId, onlyMyTasks]
  );

  useEffect(() => {
    setBoardState(hydratedBoard);
  }, [hydratedBoard]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sortRef.current && !sortRef.current.contains(target))
        setIsSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(target))
        setIsFilterOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const board = boardState.columns.length ? boardState : hydratedBoard;

  const preparedBoard = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return {
      columns: board.columns.map((column) => {
        let cards = [...column.cards];

        if (normalizedSearch) {
          cards = cards.filter((card) =>
            card.title.toLowerCase().includes(normalizedSearch)
          );
        }

        if (mockFilter === "withDueDate") {
          cards = cards.filter((card) => Boolean(card.dueDate));
        }

        if (mockFilter === "withoutDueDate") {
          cards = cards.filter((card) => !card.dueDate);
        }

        if (filterDeadlineOverdue) {
          const now = Date.now();
          cards = cards.filter(
            (card) => card.dueDate && new Date(card.dueDate).getTime() < now
          );
        }

        if (filterDeadlineToday) {
          const today = new Date().toDateString();
          cards = cards.filter(
            (card) =>
              card.dueDate && new Date(card.dueDate).toDateString() === today
          );
        }

        if (filterDeadlineTomorrow) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toDateString();
          cards = cards.filter(
            (card) =>
              card.dueDate &&
              new Date(card.dueDate).toDateString() === tomorrowStr
          );
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

        if (
          filterPriorityUrgent ||
          filterPriorityHigh ||
          filterPriorityMedium ||
          filterPriorityLow
        ) {
          cards = cards.filter((_, idx) => {
            if (filterPriorityUrgent && idx % 4 === 0) return true;
            if (filterPriorityHigh && idx % 4 === 1) return true;
            if (filterPriorityMedium && idx % 4 === 2) return true;
            if (filterPriorityLow && idx % 4 === 3) return true;
            return false;
          });
        }

        cards.sort((a, b) => {
          const aTime = a.dueDate
            ? new Date(a.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bTime = b.dueDate
            ? new Date(b.dueDate).getTime()
            : Number.MAX_SAFE_INTEGER;

          if (mockSort === "urgentFirst") return aTime - bTime;
          if (mockSort === "oldestFirst")
            return a.taskId.localeCompare(b.taskId);
          if (mockSort === "assigneeAsc") return a.title.localeCompare(b.title);
          return b.taskId.localeCompare(a.taskId);
        });

        return {
          ...column,
          cards,
        };
      }),
    } as KanbanBoard<BoardCard>;
  }, [
    board,
    searchValue,
    mockFilter,
    mockSort,
    onlyMyTasks,
    filterDeadlineOverdue,
    filterDeadlineToday,
    filterDeadlineTomorrow,
    filterDeadlineThisWeek,
    filterPriorityUrgent,
    filterPriorityHigh,
    filterPriorityMedium,
    filterPriorityLow,
  ]);

  const sortLabel =
    mockSort === "urgentFirst"
      ? "Сначала срочные"
      : mockSort === "newestFirst"
      ? "Сначала новые"
      : mockSort === "oldestFirst"
      ? "Сначала старые"
      : "Исполнитель: А -> Я";
  const assigneeFacets: Array<{ id: string; displayName?: string | null }> = [];

  const handleMoveCard = async (
    card: BoardCard,
    source: any,
    destination: any
  ) => {
    setBoardState((current) => moveCard(current, source, destination));
    void card;
    void source;
    void destination;
  };

  const handleSendComment = async () => {
    if (!selectedTask || !commentText.trim()) return;
    await addTaskComment({
      eventId: selectedTask.eventId,
      taskId: selectedTask.taskId,
      text: commentText.trim(),
    }).unwrap();
    setCommentText("");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.sidebar}>
        <Sidebar notificationCount={5} />
      </div>

      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageHeaderTitle}>Мои задачи</h1>
        </div>

        {isLoading ? (
          <p className={styles.subtitle}>Загружаем доску...</p>
        ) : (
          <section className={styles.boardSurface}>
            <div className={styles.boardControls}>
              <div className={styles.controlsLeft}>
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
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterDeadlineOverdue((prev) => !prev)
                          }
                        />
                        Просрочен
                      </label>
                      <label>
                        <Checkbox
                          checked={filterDeadlineToday}
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterDeadlineToday((prev) => !prev)
                          }
                        />
                        Сегодня
                      </label>
                      <label>
                        <Checkbox
                          checked={filterDeadlineTomorrow}
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterDeadlineTomorrow((prev) => !prev)
                          }
                        />
                        Завтра
                      </label>
                      <label>
                        <Checkbox
                          checked={filterDeadlineThisWeek}
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterDeadlineThisWeek((prev) => !prev)
                          }
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
                              checked={selectedAssigneeIds.includes(
                                assignee.id
                              )}
                              className="ep-checkbox"
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
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterPriorityUrgent((prev) => !prev)
                          }
                        />
                        Срочный
                      </label>
                      <label>
                        <Checkbox
                          checked={filterPriorityHigh}
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterPriorityHigh((prev) => !prev)
                          }
                        />
                        Высокий
                      </label>
                      <label>
                        <Checkbox
                          checked={filterPriorityMedium}
                          className="ep-checkbox"
                          onChange={() =>
                            setFilterPriorityMedium((prev) => !prev)
                          }
                        />
                        Средний
                      </label>
                      <label>
                        <Checkbox
                          checked={filterPriorityLow}
                          className="ep-checkbox"
                          onChange={() => setFilterPriorityLow((prev) => !prev)}
                        />
                        Низкий
                      </label>

                      <div className={styles.onlyMyWrap}>
                        <Switch
                          checked={onlyMyTasks}
                          onChange={setOnlyMyTasks}
                          className="ep-switch"
                        />
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
                          setMockFilter("all");
                        }}
                      >
                        Сбросить
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
            </div>

            <div className={styles.boardLayout}>
              <section className={styles.boardWrap}>
                <ControlledBoard<BoardCard>
                  disableColumnDrag
                  renderCard={(card) => (
                    <div
                      className={styles.taskCard}
                      onClick={() => setSelectedTask(card)}
                    >
                      <BoardTaskCard
                        title={card.title}
                        description={card.description}
                        dueDate={card.dueDate}
                        assigneeName={card.assigneeName}
                        assigneeAvatar={card.assigneeAvatar}
                        priority={card.priority}
                        commentsCount={card.commentsCount}
                        avatarFallbackType="event"
                      />
                    </div>
                  )}
                  renderColumnHeader={(column) => {
                    const boardColumn = column as BoardColumn;
                    const columnIndex = board.columns.findIndex(
                      (item) => String(item.id) === String(boardColumn.id)
                    );

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

        {selectedTask && (
          <>
            <button
              type="button"
              className={styles.taskBackdrop}
              onClick={() => setSelectedTask(null)}
            />
            <aside className={styles.taskPanel}>
              <div className={styles.taskPanelHeader}>
                <h3>{selectedTask.title}</h3>
                <button
                  type="button"
                  className={styles.taskClose}
                  onClick={() => setSelectedTask(null)}
                >
                  <XLgIcon />
                </button>
              </div>

              <div className={styles.taskMeta}>
                <StatusIcon className={styles.metaIcon} />
                <span>Статус</span>
                <strong>{selectedTask.status}</strong>
              </div>
              <div className={styles.taskMeta}>
                <FlagIcon className={styles.metaIcon} />
                <span>Приоритет</span>
                <strong>{selectedTask.priority}</strong>
              </div>
              <div className={styles.taskMeta}>
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
              <div className={styles.taskMeta}>
                <PersonIcon className={styles.metaIcon} />
                <span>Исполнитель</span>
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
                  <span>Описание</span>
                </div>
                <p>{selectedTask.description || "Описание отсутствует"}</p>
              </div>

              <div className={styles.taskTabs}>
                <button
                  type="button"
                  className={
                    activeTaskTab === "comments" ? styles.tabActive : ""
                  }
                  onClick={() => setActiveTaskTab("comments")}
                >
                  Комментарии
                </button>
                <button
                  type="button"
                  className={
                    activeTaskTab === "history" ? styles.tabActive : ""
                  }
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
                          <strong>
                            {comment.authorName || "Пользователь"}
                          </strong>
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
                          {item.description ||
                            item.action ||
                            "Изменение задачи"}
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
                  <button
                    type="button"
                    onClick={() => void handleSendComment()}
                  >
                    <SendIcon />
                  </button>
                </div>
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
