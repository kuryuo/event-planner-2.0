import { http, HttpResponse } from "msw";
import type { ChatAttachment, ChatMessage } from "@/types/api/Chat";
import { API_BASE_URL } from "../config";
import { requireMockAuth } from "../utils/requireMockAuth";

interface SendMessageBody {
  text: string;
  replyToMessageId?: string;
}

interface UpdateMessageBody {
  text?: string;
  removeAttachmentIds?: string[];
}

let nextMessageId = 3;
let nextAttachmentId = 2;

const messagesByEvent = new Map<string, ChatMessage[]>([
  [
    "mock-event-1",
    [
      {
        id: "mock-message-1",
        eventId: "mock-event-1",
        authorId: "mock-user-2",
        authorName: "Peter Petrov",
        authorAvatarUrl: null,
        text: "Hi! When does the registration start?",
        createdAt: "2026-08-17T10:00:00.000Z",
        isEdited: false,
        replyToMessageId: null,
        replyToMessage: null,
        attachments: [],
      },
      {
        id: "mock-message-2",
        eventId: "mock-event-1",
        authorId: "mock-user-1",
        authorName: "Ivan Ivanov",
        authorAvatarUrl: null,
        text: "Registration starts at 09:30.",
        createdAt: "2026-08-17T10:05:00.000Z",
        isEdited: false,
        replyToMessageId: "mock-message-1",
        replyToMessage: {
          id: "mock-message-1",
          authorName: "Peter Petrov",
          text: "Hi! When does the registration start?",
        },
        attachments: [],
      },
    ],
  ],
]);

const getMessages = ({ eventId }: { eventId: string }): ChatMessage[] => {
  if (!messagesByEvent.has(eventId)) {
    messagesByEvent.set(eventId, []);
  }

  return messagesByEvent.get(eventId)!;
};

const createAttachment = ({ file }: { file: File }): ChatAttachment => ({
  id: `mock-chat-attachment-${nextAttachmentId++}`,
  fileName: file.name,
  filePath: `${window.location.origin}/mock-assets/event.svg`,
  contentType: file.type || "application/octet-stream",
  size: file.size,
});

const createMessage = ({
  eventId,
  text,
  replyToMessageId,
  attachments = [],
}: {
  eventId: string;
  text: string;
  replyToMessageId?: string;
  attachments?: ChatAttachment[];
}): ChatMessage => {
  const messages = getMessages({ eventId });
  const repliedMessage = messages.find(({ id }) => id === replyToMessageId);

  const message: ChatMessage = {
    id: `mock-message-${nextMessageId++}`,
    eventId,
    authorId: "mock-user-1",
    authorName: "Ivan Ivanov",
    authorAvatarUrl: null,
    text,
    createdAt: new Date().toISOString(),
    isEdited: false,
    replyToMessageId: replyToMessageId ?? null,
    replyToMessage: repliedMessage
      ? {
          id: repliedMessage.id,
          authorName: repliedMessage.authorName,
          text: repliedMessage.text,
        }
      : null,
    attachments,
  };

  messages.push(message);

  return message;
};

export const chatHandlers = [
  http.get(
    `${API_BASE_URL}/api/events/:eventId/chat/messages/search`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const text = url.searchParams.get("text")?.toLowerCase() ?? "";
      const maxResults = Number(url.searchParams.get("maxResults") ?? 100);

      const messages = getMessages({
        eventId: String(params.eventId),
      })
        .filter((message) => message.text.toLowerCase().includes(text))
        .slice(0, maxResults);

      return HttpResponse.json({ result: messages });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/chat/messages`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const eventId = String(params.eventId);
      const messages = getMessages({ eventId });
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const count = Number(url.searchParams.get("count") ?? 50);

      return HttpResponse.json({
        result: messages.slice(offset, offset + count),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/chat/messages`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const body = (await request.json()) as SendMessageBody;

      if (!body.text.trim()) {
        return HttpResponse.json(
          { message: "Message text is required" },
          { status: 400 }
        );
      }

      createMessage({
        eventId: String(params.eventId),
        text: body.text,
        replyToMessageId: body.replyToMessageId,
      });

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/chat/messages/with-files`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const formData = await request.formData();
      const text = String(formData.get("Text") ?? "");
      const replyToMessageId = formData.get("ReplyToMessageId")?.toString();
      const attachments = formData
        .getAll("Files")
        .filter((file): file is File => typeof file !== "string")
        .map((file) => createAttachment({ file }));

      if (!text.trim() && attachments.length === 0) {
        return HttpResponse.json(
          { message: "Message or file is required" },
          { status: 400 }
        );
      }

      createMessage({
        eventId: String(params.eventId),
        text,
        replyToMessageId,
        attachments,
      });

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.patch(
    `${API_BASE_URL}/api/events/:eventId/chat/messages/:messageId`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const message = getMessages({
        eventId: String(params.eventId),
      }).find(({ id }) => id === params.messageId);

      if (!message) {
        return HttpResponse.json(
          { message: "Message not found" },
          { status: 404 }
        );
      }

      const body = (await request.json()) as UpdateMessageBody;

      if (body.text !== undefined) {
        message.text = body.text;
        message.isEdited = true;
      }

      if (body.removeAttachmentIds?.length) {
        message.attachments = message.attachments?.filter(
          ({ id }) => !body.removeAttachmentIds?.includes(id)
        );
      }

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/chat/messages/:messageId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const eventId = String(params.eventId);
      const messages = getMessages({ eventId });
      const filteredMessages = messages.filter(
        ({ id }) => id !== params.messageId
      );

      if (filteredMessages.length === messages.length) {
        return HttpResponse.json(
          { message: "Message not found" },
          { status: 404 }
        );
      }

      messagesByEvent.set(eventId, filteredMessages);

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/chat/messages/:messageId/attachments`,
    async ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const message = getMessages({
        eventId: String(params.eventId),
      }).find(({ id }) => id === params.messageId);

      if (!message) {
        return HttpResponse.json(
          { message: "Message not found" },
          { status: 404 }
        );
      }

      const formData = await request.formData();
      const attachments = formData
        .getAll("Files")
        .filter((file): file is File => typeof file !== "string")
        .map((file) => createAttachment({ file }));

      message.attachments = [...(message.attachments ?? []), ...attachments];

      return new HttpResponse(null, { status: 204 });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/chat/messages/:messageId/attachments/:attachmentId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const message = getMessages({
        eventId: String(params.eventId),
      }).find(({ id }) => id === params.messageId);

      if (!message) {
        return HttpResponse.json(
          { message: "Message not found" },
          { status: 404 }
        );
      }

      message.attachments = message.attachments?.filter(
        ({ id }) => id !== params.attachmentId
      );

      return new HttpResponse(null, { status: 204 });
    }
  ),
];
