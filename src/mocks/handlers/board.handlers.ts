import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../config";
import {
  createMockColumn,
  createMockTask,
  deleteMockColumn,
  deleteMockTask,
  getMockAssignedTasks,
  getMockBoard,
  moveMockTask,
  updateMockColumn,
  updateMockTask,
} from "../db/board.db";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

interface ColumnBody {
  name?: string;
  order?: number;
}

interface CreateTaskBody {
  title: string;
  description?: string;
  assignedUserId?: string;
  dueDate?: string;
  priority?: string;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  assigneeId?: string;
  deadline?: string;
  priority?: string;
}

interface MoveTaskBody {
  targetColumnId: string;
  newOrder: number;
}

export const boardHandlers = [
  http.get(
    `${API_BASE_URL}/api/events/:eventId/board/facets`,
    ({ request }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      return HttpResponse.json({
        result: [
          {
            id: "mock-user-1",
            displayName: mockT("board.user1", request),
            avatarUrl: null,
          },
          {
            id: "mock-user-2",
            displayName: mockT("board.user2", request),
            avatarUrl: null,
          },
        ],
      });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/board/assignees`,
    ({ request }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      return HttpResponse.json({
        result: [
          {
            id: "mock-user-1",
            displayName: mockT("board.user1", request),
            avatarUrl: null,
            role: "Organizer",
          },
          {
            id: "mock-user-2",
            displayName: mockT("board.user2", request),
            avatarUrl: null,
            role: "Observer",
          },
        ],
      });
    }
  ),

  http.get(`${API_BASE_URL}/api/users/me/board/my-tasks`, ({ request }) => {
    const authError = requireMockAuth({ request });

    return (
      authError ??
      HttpResponse.json({
        result: getMockAssignedTasks({ request }),
      })
    );
  }),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/board/my-tasks`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      return (
        authError ??
        HttpResponse.json(
          getMockBoard({
            eventId: String(params.eventId),
            mineOnly: true,
            request,
          })
        )
      );
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/board/event/my-tasks`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      return (
        authError ??
        HttpResponse.json(
          getMockBoard({
            eventId: String(params.eventId),
            mineOnly: true,
            request,
          })
        )
      );
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/board`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      return (
        authError ??
        HttpResponse.json(
          getMockBoard({ eventId: String(params.eventId), request })
        )
      );
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/board/columns`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as ColumnBody;

      if (!body.name) {
        return HttpResponse.json(
          { message: mockT("board.columnNameRequired", request) },
          { status: 400 }
        );
      }

      createMockColumn({
        eventId: String(params.eventId),
        name: body.name,
      });

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.put(
    `${API_BASE_URL}/api/events/:eventId/board/columns/:columnId`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as ColumnBody;
      const isUpdated = updateMockColumn({
        eventId: String(params.eventId),
        columnId: String(params.columnId),
        ...body,
      });

      return isUpdated
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ message: mockT("board.columnNotFound", request) }, { status: 404 });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/board/columns/:columnId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const isDeleted = deleteMockColumn({
        eventId: String(params.eventId),
        columnId: String(params.columnId),
      });

      return isDeleted
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ message: mockT("board.columnNotFound", request) }, { status: 404 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/board/columns/:columnId/tasks`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as CreateTaskBody;
      const isCreated = createMockTask({
        eventId: String(params.eventId),
        columnId: String(params.columnId),
        ...body,
      });

      return isCreated
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ message: mockT("board.columnNotFound", request) }, { status: 404 });
    }
  ),

  http.put(
    `${API_BASE_URL}/api/events/:eventId/board/tasks/:taskId`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as UpdateTaskBody;
      const isUpdated = updateMockTask({
        eventId: String(params.eventId),
        taskId: String(params.taskId),
        ...body,
      });

      return isUpdated
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ message: mockT("board.taskNotFound", request) }, { status: 404 });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/board/tasks/:taskId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const isDeleted = deleteMockTask({
        eventId: String(params.eventId),
        taskId: String(params.taskId),
      });

      return isDeleted
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ message: mockT("board.taskNotFound", request) }, { status: 404 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/board/tasks/:taskId/move`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as MoveTaskBody;
      const isMoved = moveMockTask({
        eventId: String(params.eventId),
        taskId: String(params.taskId),
        ...body,
      });

      return isMoved
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json(
            { message: mockT("board.taskOrColumnNotFound", request) },
            { status: 404 }
          );
    }
  ),
];
