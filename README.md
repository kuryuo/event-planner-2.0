# Event Planner 2.0

A web application for planning, organizing, and managing events. It combines a calendar view, event workspaces, task boards, real-time chat, documents, and media — so organizers and participants can collaborate in one place.

## Useful links

- [Design in Figma](https://www.figma.com/design/j03utCeJszMWlgT3yTLo7k/Event-planner-V2.0?node-id=0-1&p=f&t=U1yDEXwC8CdvfNNl-0)

## Getting started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (or **Yarn**, if you prefer)

### Install dependencies

Clone the repository:

```
https://github.com/kuryuo/event-planner-2.0
```

Go to the project folder:

```
cd event-planner-2.0
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

The app will be available at: `http://localhost:5173`.

## Tech stack

* React 19
* TypeScript
* Vite
* React Router v7
* Redux Toolkit + RTK Query
* Ant Design 6
* Sass / SCSS
* FullCalendar — calendar views
* SignalR — real-time chat and notifications
* @hello-pangea/dnd / @caldwell619/react-kanban — drag-and-drop task boards
* date-fns — date formatting
* emoji-picker-react — emoji support in chat

## Main features

### Authentication and profile

- **Sign in / sign up**: Users can register and log in. Unauthenticated users are redirected to the auth page.
- **User profile**: Edit personal details (name, profession, phone, Telegram, email), upload an avatar, change password, and manage account actions (logout, delete account).
- **Light / dark theme**: Theme can be switched from the sidebar.

### Calendar and event discovery

- **Main calendar**: Browse events on an interactive FullCalendar (day / week / month views).
- **Filters**: Narrow events by date range, organizers, categories/tags, venue format (in-person, online, hybrid), event types, free places, and “my events”.
- **Search**: Find events from the sidebar search, with recent searches stored locally.
- **Sidebar navigation**: Quick access to calendar, tasks, archive, notifications, and profile; shows upcoming / subscribed events.

### Creating and editing events

- **Event editor**: Create new events or edit existing ones (title, description, dates, location, auditorium, venue format, categories, types, color, avatar, max participants).
- **Lifecycle**: Events move through states such as Draft, Published, Completed, Cancelled, and Archived.
- **Roles**: Assign organizers, editors, assistants, and observers with different permissions for managing the event.

### Event workspace

Each event opens as a dedicated workspace with tabs:

- **Overview**: Event details, description, location, participants, posts/announcements, and a tasks summary for organizers.
- **Documents**: Attachments (files and links), notes, filtering and sorting by author, type, and date.
- **Kanban board**: Per-event task board with columns, drag-and-drop, priorities, assignees, deadlines, comments, and history.
- **Chat**: Real-time event chat via SignalR — messages, emoji, file attachments, search, edit/delete, and unread indicators.
- **Media**: Photo gallery — upload, browse, and delete event photos.
- **Participants**: View subscribers/participants and manage role assignments (where permitted).

Archived or finished events switch to a read-focused layout (overview, documents, media).

### Tasks

- **Personal tasks board**: Aggregate tasks assigned to the current user across events on a global Kanban-style board.
- **Task details**: View description, assignee, priority, deadline, comments, and change history.
- **Filtering and sorting**: Filter by status, priority, deadline, assignee, and related event.

### Archive and notifications

- **Archive**: Browse past / completed / cancelled events with search.
- **Notifications**: In-app notifications with real-time updates over SignalR (including chat-related alerts).

### Collaboration and real-time

- **SignalR hubs**: Live updates for notifications and event chat without refreshing the page.
- **Session path restore**: Current route is kept in `sessionStorage` so navigation state can be restored within the session.
