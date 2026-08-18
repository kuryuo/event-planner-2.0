import { http, HttpResponse } from "msw";
import type { EventPost } from "@/types/api/Event";
import { API_BASE_URL } from "../config";
import { requireMockAuth } from "../utils/requireMockAuth";
import { mockT } from "../utils/mockI18n";

let nextPostId = 2;

const postsByEvent = new Map<string, EventPost[]>([
  [
    "mock-event-1",
    [
      {
        id: "mock-post-1",
        eventId: "mock-event-1",
        authorId: "mock-user-1",
        title: "Registration is open",
        text: "Registration is now open for the Frontend Meetup.",
        createdAt: "2026-08-15T10:00:00.000Z",
      },
    ],
  ],
]);

const getPosts = ({ eventId }: { eventId: string }): EventPost[] => {
  if (!postsByEvent.has(eventId)) {
    postsByEvent.set(eventId, []);
  }

  return postsByEvent.get(eventId)!;
};

export const eventPostHandlers = [
  http.get(
    `${API_BASE_URL}/api/events/:eventId/posts`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const eventId = String(params.eventId);
      const posts = getPosts({ eventId });
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const count = Number(url.searchParams.get("count") ?? posts.length);

      return HttpResponse.json({
        result: posts.slice(offset, offset + count).map((post) => ({
          ...post,
          title:
            post.title === "Registration is open"
              ? mockT("post.seedTitle", request)
              : post.title,
          text:
            post.text === "Registration is now open for the Frontend Meetup."
              ? mockT("post.seedText", request)
              : post.text,
        })),
      });
    }
  ),

  http.post(
    `${API_BASE_URL}/api/events/:eventId/posts`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const title = url.searchParams.get("title");
      const text = url.searchParams.get("text");

      if (!title || !text) {
        return HttpResponse.json(
          { message: mockT("post.titleAndTextRequired", request) },
          { status: 400 }
        );
      }

      const eventId = String(params.eventId);
      const post: EventPost = {
        id: `mock-post-${nextPostId++}`,
        eventId,
        authorId: "mock-user-1",
        title,
        text,
        createdAt: new Date().toISOString(),
      };

      getPosts({ eventId }).push(post);

      return HttpResponse.json({ result: post }, { status: 201 });
    }
  ),

  http.get(
    `${API_BASE_URL}/api/events/:eventId/posts/:postId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const post = getPosts({
        eventId: String(params.eventId),
      }).find(({ id }) => id === params.postId);

      if (!post) {
        return HttpResponse.json(
          { message: mockT("post.notFound", request) },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        result: {
          ...post,
          title:
            post.title === "Registration is open"
              ? mockT("post.seedTitle", request)
              : post.title,
          text:
            post.text === "Registration is now open for the Frontend Meetup."
              ? mockT("post.seedText", request)
              : post.text,
        },
      });
    }
  ),

  http.put(
    `${API_BASE_URL}/api/events/:eventId/posts/:postId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const url = new URL(request.url);
      const title = url.searchParams.get("title");
      const text = url.searchParams.get("text");
      const post = getPosts({
        eventId: String(params.eventId),
      }).find(({ id }) => id === params.postId);

      if (!post) {
        return HttpResponse.json(
          { message: mockT("post.notFound", request) },
          { status: 404 }
        );
      }

      if (title !== null) {
        post.title = title;
      }

      if (text !== null) {
        post.text = text;
      }

      return HttpResponse.json({
        result: {
          ...post,
          title:
            post.title === "Registration is open"
              ? mockT("post.seedTitle", request)
              : post.title,
          text:
            post.text === "Registration is now open for the Frontend Meetup."
              ? mockT("post.seedText", request)
              : post.text,
        },
      });
    }
  ),

  http.delete(
    `${API_BASE_URL}/api/events/:eventId/posts/:postId`,
    ({ request, params }) => {
      const authError = requireMockAuth({ request });

      if (authError) {
        return authError;
      }

      const eventId = String(params.eventId);
      const posts = getPosts({ eventId });
      const filteredPosts = posts.filter(({ id }) => id !== params.postId);

      if (filteredPosts.length === posts.length) {
        return HttpResponse.json(
          { message: mockT("post.notFound", request) },
          { status: 404 }
        );
      }

      postsByEvent.set(eventId, filteredPosts);

      return new HttpResponse(null, { status: 204 });
    }
  ),
];
