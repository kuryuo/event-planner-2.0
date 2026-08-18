import { http, HttpResponse } from "msw";
import type {
  EventNote,
  EventTaskComment,
  EventTaskHistoryItem,
} from "@/types/api/Event";
import { API_BASE_URL } from "../config";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

interface TextBody {
  text: string;
}

let nextNoteId = 2;
let nextCommentId = 2;

const notesByEvent = new Map<string, EventNote[]>([
  [
    "mock-event-1",
    [
      {
        id: "mock-note-1",
        eventId: "mock-event-1",
        authorId: "mock-user-1",
        authorName: "Ivan Ivanov",
        text: "Check the venue readiness one day before the event.",
        createdAt: "2026-08-15T10:00:00.000Z",
        updatedAt: "2026-08-15T10:00:00.000Z",
      },
    ],
  ],
]);

const commentsByTask = new Map<string, EventTaskComment[]>([
  [
    "mock-task-1",
    [
      {
        id: "mock-comment-1",
        text: "The draft agenda is already ready.",
        authorName: "Ivan Ivanov",
        createdAt: "2026-08-16T12:00:00.000Z",
      },
    ],
  ],
]);

const historyByTask = new Map<string, EventTaskHistoryItem[]>([
  [
    "mock-task-1",
    [
      {
        id: "mock-history-1",
        action: "Created",
        description: "Task created",
        authorName: "Ivan Ivanov",
        createdAt: "2026-08-15T09:00:00.000Z",
      },
      {
        id: "mock-history-2",
        action: "PriorityChanged",
        description: "Priority changed to High",
        authorName: "Ivan Ivanov",
        createdAt: "2026-08-16T11:00:00.000Z",
      },
    ],
  ],
]);

export const collaborationHandlers = [
  http.get(
    `${API_BASE_URL}/api/events/:eventId/notes`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      return HttpResponse.json({
        result: (notesByEvent.get(String(params.eventId)) ?? []).map((note) => ({
          ...note,
          text:
            note.text === "Check the venue readiness one day before the event."
              ? mockT("collab.noteSeed", request)
              : note.text,
          authorName:
            note.authorName === "Ivan Ivanov"
              ? mockT("chat.userIvan", request)
              : note.authorName,
        })),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/notes`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as TextBody;

      if (!body.text.trim()) {
        return HttpResponse.json(
          { message: mockT("collab.noteTextRequired", request) },
          { status: 400 }
        );
      }

      const eventId = String(params.eventId);
      const now = new Date().toISOString();
      const note: EventNote = {
        id: `mock-note-${nextNoteId++}`,
        eventId,
        authorId: "mock-user-1",
        authorName: mockT("chat.userIvan", request),
        text: body.text,
        createdAt: now,
        updatedAt: now,
      };

      notesByEvent.set(eventId, [...(notesByEvent.get(eventId) ?? []), note]);

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.put(
    `${API_BASE_URL}/api/events/:eventId/notes/:noteId`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as TextBody;
      const eventId = String(params.eventId);
      const noteId = String(params.noteId);
      const notes = notesByEvent.get(eventId) ?? [];
      const note = notes.find(({ id }) => id === noteId);

      if (!note) {
        return HttpResponse.json(
          { message: mockT("collab.noteNotFound", request) },
          { status: 404 }
        );
      }

      note.text = body.text;
      note.updatedAt = new Date().toISOString();

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/board/tasks/:taskId/comments`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      return HttpResponse.json({
        result: (commentsByTask.get(String(params.taskId)) ?? []).map((comment) => ({
          ...comment,
          text:
            comment.text === "The draft agenda is already ready."
              ? mockT("collab.commentSeed", request)
              : comment.text,
          authorName:
            comment.authorName === "Ivan Ivanov"
              ? mockT("chat.userIvan", request)
              : comment.authorName,
        })),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/board/tasks/:taskId/comments`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as TextBody;
      const taskId = String(params.taskId);
      const comment: EventTaskComment = {
        id: `mock-comment-${nextCommentId++}`,
        text: body.text,
        authorName: mockT("chat.userIvan", request),
        createdAt: new Date().toISOString(),
      };

      commentsByTask.set(taskId, [
        ...(commentsByTask.get(taskId) ?? []),
        comment,
      ]);

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/board/tasks/:taskId/history`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      return HttpResponse.json({
        result: (historyByTask.get(String(params.taskId)) ?? []).map((item) => ({
          ...item,
          description:
            item.description === "Task created"
              ? mockT("collab.historyTaskCreated", request)
              : item.description === "Priority changed to High"
                ? mockT("collab.historyPriorityChanged", request)
                : item.description,
          authorName:
            item.authorName === "Ivan Ivanov"
              ? mockT("chat.userIvan", request)
              : item.authorName,
        })),
      });
    }
  ),
];
