import type {
  EventBoardColumn,
  EventBoardTask,
  GetEventBoardResponse,
  MyAssignedTaskItem,
} from "@/types/api/Event";
import { mockT } from "../utils/mockI18n";

interface MockBoardTask extends EventBoardTask {
  assignedUserId?: string;
  order: number;
}

interface MockBoardColumn extends EventBoardColumn {
  name: string;
  tasks: MockBoardTask[];
}

interface CreateColumnParams {
  eventId: string;
  name: string;
}

interface UpdateColumnParams {
  eventId: string;
  columnId: string;
  name?: string;
  order?: number;
}

interface CreateTaskParams {
  eventId: string;
  columnId: string;
  title: string;
  description?: string;
  assignedUserId?: string;
  dueDate?: string;
  priority?: string;
}

interface UpdateTaskParams {
  eventId: string;
  taskId: string;
  title?: string;
  description?: string;
  assigneeId?: string;
  deadline?: string;
  priority?: string;
}

interface MoveTaskParams {
  eventId: string;
  taskId: string;
  targetColumnId: string;
  newOrder: number;
}

let nextColumnId = 4;
let nextTaskId = 4;

const boards = new Map<string, MockBoardColumn[]>([
  [
    "mock-event-1",
    [
      {
        id: "mock-column-1",
        name: "Planned",
        tasks: [
          {
            id: "mock-task-1",
            title: "Prepare the agenda",
            description: "Align talks and schedule",
            assignedUserId: "mock-user-1",
            assigneeName: "Ivan Ivanov",
            assignedUserName: "Ivan Ivanov",
            dueDate: "2026-09-01T18:00:00.000Z",
            deadline: "2026-09-01T18:00:00.000Z",
            priority: "High",
            commentsCount: 1,
            commentCount: 1,
            order: 0,
          },
        ],
      },
      {
        id: "mock-column-2",
        name: "In progress",
        tasks: [
          {
            id: "mock-task-2",
            title: "Order catering",
            description: "Choose menu for 100 people",
            assignedUserId: "mock-user-2",
            assigneeName: "Peter Petrov",
            assignedUserName: "Peter Petrov",
            dueDate: "2026-09-05T18:00:00.000Z",
            deadline: "2026-09-05T18:00:00.000Z",
            priority: "Medium",
            commentsCount: 0,
            commentCount: 0,
            order: 0,
          },
        ],
      },
      {
        id: "mock-column-3",
        name: "Done",
        tasks: [
          {
            id: "mock-task-3",
            title: "Book the venue",
            assignedUserId: "mock-user-1",
            assigneeName: "Ivan Ivanov",
            assignedUserName: "Ivan Ivanov",
            priority: "Urgent",
            commentsCount: 0,
            commentCount: 0,
            order: 0,
          },
        ],
      },
    ],
  ],
]);

const getColumns = ({ eventId }: { eventId: string }): MockBoardColumn[] => {
  if (!boards.has(eventId)) {
    boards.set(eventId, []);
  }

  return boards.get(eventId)!;
};

const cloneColumns = (columns: MockBoardColumn[]): EventBoardColumn[] =>
  columns.map((column) => ({
    ...column,
    tasks: column.tasks.map((task) => ({ ...task })),
  }));

const isAnyOf = ({
  value,
  variants,
}: {
  value: string | null | undefined;
  variants: string[];
}): boolean => variants.includes(value ?? "");

const localizeColumnName = ({
  name,
  request,
}: {
  name: string;
  request?: Request;
}): string => {
  if (isAnyOf({ value: name, variants: ["Planned", "Запланировано"] })) {
    return mockT("board.columnPlanned", request);
  }
  if (isAnyOf({ value: name, variants: ["In progress", "В работе"] })) {
    return mockT("board.columnInProgress", request);
  }
  if (isAnyOf({ value: name, variants: ["Done", "Готово"] })) {
    return mockT("board.columnDone", request);
  }
  return name;
};

const localizeTask = ({
  task,
  request,
}: {
  task: EventBoardTask;
  request?: Request;
}): EventBoardTask => ({
  ...task,
  title:
    isAnyOf({
      value: task.title,
      variants: ["Prepare the agenda", "Подготовить повестку"],
    })
      ? mockT("board.taskPrepareAgendaTitle", request)
      : isAnyOf({
          value: task.title,
          variants: ["Order catering", "Заказать кейтеринг"],
        })
        ? mockT("board.taskOrderCateringTitle", request)
        : isAnyOf({
            value: task.title,
            variants: ["Book the venue", "Забронировать площадку"],
          })
          ? mockT("board.taskBookVenueTitle", request)
          : task.title,
  description:
    isAnyOf({
      value: task.description,
      variants: ["Align talks and schedule", "Согласовать выступления и расписание"],
    })
      ? mockT("board.taskPrepareAgendaDescription", request)
      : isAnyOf({
          value: task.description,
          variants: ["Choose menu for 100 people", "Выбрать меню на 100 человек"],
        })
        ? mockT("board.taskOrderCateringDescription", request)
        : task.description,
  assigneeName:
    isAnyOf({ value: task.assigneeName, variants: ["Ivan Ivanov", "Иван Иванов"] })
      ? mockT("board.user1", request)
      : isAnyOf({
          value: task.assigneeName,
          variants: ["Peter Petrov", "Пётр Петров"],
        })
        ? mockT("board.user2", request)
        : task.assigneeName,
  assignedUserName:
    isAnyOf({
      value: task.assignedUserName,
      variants: ["Ivan Ivanov", "Иван Иванов"],
    })
      ? mockT("board.user1", request)
      : isAnyOf({
          value: task.assignedUserName,
          variants: ["Peter Petrov", "Пётр Петров"],
        })
        ? mockT("board.user2", request)
        : task.assignedUserName,
});

export const getMockBoard = ({
  eventId,
  mineOnly = false,
  request,
}: {
  eventId: string;
  mineOnly?: boolean;
  request?: Request;
}): GetEventBoardResponse => {
  const columns = getColumns({ eventId });
  const filteredColumns = mineOnly
    ? columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter(
          ({ assignedUserId }) => assignedUserId === "mock-user-1"
        ),
      }))
    : columns;

  return localizeBoard({
    request,
    board: {
    result: {
      columns: cloneColumns(filteredColumns),
    },
  }});
};

const localizeBoard = ({
  board,
  request,
}: {
  board: GetEventBoardResponse;
  request?: Request;
}): GetEventBoardResponse => {
  const columns = board.result?.columns ?? [];

  return {
    result: {
      columns: columns.map((column) => ({
        ...column,
        name: localizeColumnName({ name: column.name ?? "", request }),
        tasks: (column.tasks ?? []).map((task) =>
          localizeTask({ task, request })
        ),
      })),
    },
  };
};

export const getMockAssignedTasks = ({ request }: { request?: Request } = {}): MyAssignedTaskItem[] =>
  Array.from(boards.entries()).flatMap(([eventId, columns]) =>
    columns.flatMap((column) =>
      column.tasks
        .filter(({ assignedUserId }) => assignedUserId === "mock-user-1")
        .map((task) => ({
          ...(localizeTask({ task, request }) as MyAssignedTaskItem),
          eventId,
          eventName: mockT("board.eventName", request),
          columnId: column.id,
          status: localizeColumnName({ name: column.name, request }),
          assigneeId: task.assignedUserId,
          assigneeDisplayName:
            isAnyOf({
              value: task.assigneeName,
              variants: ["Ivan Ivanov", "Иван Иванов"],
            })
              ? mockT("board.user1", request)
              : isAnyOf({
                  value: task.assigneeName,
                  variants: ["Peter Petrov", "Пётр Петров"],
                })
                ? mockT("board.user2", request)
                : task.assigneeName,
        }))
    )
  );

export const createMockColumn = ({
  eventId,
  name,
}: CreateColumnParams): void => {
  const columns = getColumns({ eventId });

  columns.push({
    id: `mock-column-${nextColumnId++}`,
    name,
    tasks: [],
  });
};

export const updateMockColumn = ({
  eventId,
  columnId,
  name,
  order,
}: UpdateColumnParams): boolean => {
  const columns = getColumns({ eventId });
  const columnIndex = columns.findIndex(({ id }) => id === columnId);

  if (columnIndex === -1) {
    return false;
  }

  if (name !== undefined) {
    columns[columnIndex].name = name;
  }

  if (order !== undefined) {
    const [column] = columns.splice(columnIndex, 1);
    const targetIndex = Math.max(0, Math.min(order, columns.length));
    columns.splice(targetIndex, 0, column);
  }

  return true;
};

export const deleteMockColumn = ({
  eventId,
  columnId,
}: {
  eventId: string;
  columnId: string;
}): boolean => {
  const columns = getColumns({ eventId });
  const previousLength = columns.length;

  boards.set(
    eventId,
    columns.filter(({ id }) => id !== columnId)
  );

  return boards.get(eventId)!.length < previousLength;
};

export const createMockTask = ({
  eventId,
  columnId,
  title,
  description,
  assignedUserId,
  dueDate,
  priority,
}: CreateTaskParams): boolean => {
  const column = getColumns({ eventId }).find(({ id }) => id === columnId);

  if (!column) {
    return false;
  }

  column.tasks.push({
    id: `mock-task-${nextTaskId++}`,
    title,
    description,
    assignedUserId,
    assigneeName: assignedUserId ? "Ivan Ivanov" : null,
    assignedUserName: assignedUserId ? "Ivan Ivanov" : null,
    dueDate,
    deadline: dueDate,
    priority,
    commentsCount: 0,
    commentCount: 0,
    order: column.tasks.length,
  });

  return true;
};

export const updateMockTask = ({
  eventId,
  taskId,
  title,
  description,
  assigneeId,
  deadline,
  priority,
}: UpdateTaskParams): boolean => {
  for (const column of getColumns({ eventId })) {
    const task = column.tasks.find(({ id }) => id === taskId);

    if (!task) {
      continue;
    }

    Object.assign(task, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(assigneeId !== undefined && {
        assignedUserId: assigneeId,
        assigneeName: "Ivan Ivanov",
        assignedUserName: "Ivan Ivanov",
      }),
      ...(deadline !== undefined && { deadline, dueDate: deadline }),
      ...(priority !== undefined && { priority }),
    });

    return true;
  }

  return false;
};

export const deleteMockTask = ({
  eventId,
  taskId,
}: {
  eventId: string;
  taskId: string;
}): boolean => {
  for (const column of getColumns({ eventId })) {
    const previousLength = column.tasks.length;
    column.tasks = column.tasks.filter(({ id }) => id !== taskId);

    if (column.tasks.length < previousLength) {
      return true;
    }
  }

  return false;
};

export const moveMockTask = ({
  eventId,
  taskId,
  targetColumnId,
  newOrder,
}: MoveTaskParams): boolean => {
  const columns = getColumns({ eventId });
  const sourceColumn = columns.find((column) =>
    column.tasks.some(({ id }) => id === taskId)
  );
  const targetColumn = columns.find(({ id }) => id === targetColumnId);

  if (!sourceColumn || !targetColumn) {
    return false;
  }

  const taskIndex = sourceColumn.tasks.findIndex(({ id }) => id === taskId);
  const [task] = sourceColumn.tasks.splice(taskIndex, 1);
  const targetIndex = Math.max(
    0,
    Math.min(newOrder, targetColumn.tasks.length)
  );

  targetColumn.tasks.splice(targetIndex, 0, task);
  targetColumn.tasks.forEach((item, index) => {
    item.order = index;
  });

  return true;
};
