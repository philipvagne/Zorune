# OpsFlow

OpsFlow is a real-time operational workspace for teams that need to manage execution and context in the same place.

Tasks answer what needs to happen. Notes answer why, how, and what to remember.

The project currently combines:

* a NestJS + Prisma + PostgreSQL backend
* a React + Vite frontend workspace
* JWT authentication
* Socket.IO realtime updates
* organizations, projects, tasks, notes, notifications, and presence

## Product Shape

OpsFlow currently behaves like a persistent workspace instead of a page-based dashboard:

* Active Tasks always stays visible in the main workspace
* the lower context area opens and closes modular workspace cards
* top rail launcher switches between workspace areas
* notifications open as a floating overlay
* task detail opens as a docked panel rather than a blocking modal

Current workspace areas:

* Active Tasks
* Archived Tasks
* Projects
* Notes
* Organizations
* Settings
* Profile

## Tech Stack

### Frontend

* React 19
* Vite
* Axios
* Socket.IO Client
* React Hot Toast
* dnd-kit

### Backend

* NestJS
* Prisma ORM
* PostgreSQL
* Socket.IO
* JWT Authentication

## Project Structure

```txt
opsflow/
|-- apps/
|   `-- api/                 # NestJS backend
|       |-- prisma/          # Prisma schema and migrations
|       `-- src/             # API modules
|-- opsflow-dashboard/       # React frontend workspace
|-- docker-compose.yml       # Local PostgreSQL service
`-- README.md
```

## Current Features

### Authentication

* Signup with full name, username, email, and password
* Signup creates only the user account
* Users can exist without an organization after registration
* JWT login flow
* protected backend routes
* socket authentication through JWT
* frontend login/signup validation and loading states
* logout flow

### Organizations

* users can view organizations they belong to
* users with no organizations see a safe empty state
* users can create organizations from the dashboard
* organization creator becomes `OWNER`
* owners and admins can add existing users by email or username
* duplicate memberships are prevented
* organization membership scopes users, projects, tasks, notes, and search

### Projects

* projects belong to organizations
* project creation and editing from the Projects workspace
* project detail cards with active, done, and overdue task counts
* project filtering inside Active Tasks
* project access inherits organization membership

### Users

* `GET /users/me`
* `GET /users/search?q=`
* search by username, full name, or email
* results scoped to users who share an organization
* safe public profile fields only

### Tasks

* create tasks from the dashboard context area
* multi-assignee tasks
* status changes between `TODO`, `IN_PROGRESS`, and `DONE`
* drag-and-drop Kanban with dnd-kit
* due dates with overdue highlighting
* archive and restore using soft archive via `archivedAt`
* task progress updates timeline
* task detail panel synchronized from live task state

### Active Task Views

* Kanban
* Table
* Calendar agenda view

All three views reuse the same live task state and the same filters.

### Task Productivity Layer

Active Tasks currently supports local:

* search
* status filtering
* assignee filtering
* due date filtering
* project filtering
* sorting

Workspace state is persisted in `localStorage`, including:

* active workspace view
* active task view
* task filters
* selected task when still valid
* selected project organization where relevant

### Notes

OpsFlow notes are lightweight operational knowledge surfaces, not a full document system.

Supported today:

* organization-scoped notes
* optional project-linked notes
* optional task-linked notes
* Notes workspace with search and editing
* note creation from the Notes workspace
* related notes inside the task detail panel
* linked note creation directly from a task

Current note use cases:

* decisions
* procedures
* references
* task context
* internal operational memory

### Notifications

* realtime toast notifications
* floating notification dropdown
* unread counts
* notification category filters
* mark one read
* mark all read
* delete read notifications

Current notification coverage:

* task assignment
* task unassignment
* task status changes
* due date added, changed, and cleared
* task progress updates
* archive notifications where supported

### Presence

* online users tracked in memory
* online member list in the workspace
* task viewer presence
* users viewing the same task are shown in the task panel

### Command Palette

Keyboard shortcut:

* `Ctrl+K` on Windows/Linux
* `Cmd+K` on macOS

Current command palette actions:

* jump between workspace views
* open tasks
* create a new task

## Realtime Architecture

OpsFlow intentionally separates task state, notifications, updates, and presence.

### `task_updated`

Used for task state synchronization:

* status changes
* due date changes
* assignment changes
* archive and restore changes
* keeping the open task panel synchronized
* removing tasks from a user’s board when they are no longer assigned

Task updates are emitted to authorized user rooms, not broadcast globally.

### `task_update_created`

Used for user-written task progress updates:

* appends new updates to open task panels
* keeps collaborators in sync without refetching everything

### `notification`

Used for user-facing alerts:

* toast popups
* notification dropdown updates
* unread count changes

### Presence Events

```txt
presence_online_users
task_viewing_join
task_viewing_leave
task_viewers_updated
```

Presence is lightweight V1 state stored in memory only.

## Database Models

Core Prisma models:

* `User`
* `Organization`
* `Membership`
* `Project`
* `Task`
* `TaskAssignment`
* `TaskUpdate`
* `ActivityLog`
* `Notification`
* `Note`

Important modeling choices:

* `TaskUpdate` is separate from `ActivityLog`
* `Task` uses `archivedAt` for soft archive behavior
* `Note` belongs to an organization and can optionally link to a project and a task

## API Overview

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
GET  /auth/admin
```

### Users

```txt
GET /users/me
GET /users/search?q=
```

### Organizations

```txt
GET  /organizations/my
POST /organizations
GET  /organizations/:orgId
GET  /organizations/:orgId/members
POST /organizations/:orgId/members
```

### Projects

```txt
GET   /organizations/:orgId/projects
POST  /organizations/:orgId/projects
GET   /projects/:projectId
PATCH /projects/:projectId
```

### Tasks

```txt
POST   /organizations/:orgId/projects/:projectId/tasks
GET    /projects/:projectId/tasks
GET    /tasks/my
GET    /tasks/archived
PATCH  /tasks/:taskId
DELETE /tasks/:taskId
PATCH  /tasks/:taskId/assign
DELETE /tasks/:taskId/assign/:assigneeId
PATCH  /tasks/:taskId/archive
PATCH  /tasks/:taskId/restore
GET    /tasks/:taskId/activity
GET    /tasks/:taskId/updates
POST   /tasks/:taskId/updates
GET    /tasks/:taskId/notes
```

### Notes

```txt
GET    /notes
POST   /notes
GET    /notes/:noteId
PATCH  /notes/:noteId
DELETE /notes/:noteId
```

Supported note filters:

```txt
GET /notes?organizationId=...
GET /notes?projectId=...
GET /notes?taskId=...
GET /notes?q=...
```

### Notifications

```txt
GET    /tasks/notifications
PATCH  /notifications/:id/read
DELETE /notifications/:id
PATCH  /tasks/notifications/mark-all-read
```

## Notification Types

Current notification types include:

```txt
TASK_ASSIGNED
TASK_UNASSIGNED
TASK_STATUS_CHANGED
TASK_UPDATE_POSTED
TASK_DUE_DATE_ADDED
TASK_DUE_DATE_CHANGED
TASK_DUE_DATE_CLEARED
TASK_ARCHIVED
```

## Local Development

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

Default local database:

```txt
localhost:5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=opsflow
```

### 2. Backend Setup

```bash
cd apps/api
npm install
```

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/opsflow
JWT_SECRET=your_secret_here
PORT=3000
```

Run migrations and start the backend:

```bash
npx prisma migrate dev
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

### 3. Frontend Setup

```bash
cd opsflow-dashboard
npm install
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

## Useful Commands

### Backend

```bash
cd apps/api
npm run build
npm run test
npx prisma studio
```

### Frontend

```bash
cd opsflow-dashboard
npm run build
npm run lint
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd run build
```

## Manual Testing Checklist

### Authentication

1. Register a new user.
2. Log in and confirm the dashboard loads.
3. Log out and back in.
4. Confirm a user with no organizations does not crash the app.

### Organizations And Projects

1. Open Organizations and create an organization.
2. Confirm the creator becomes `OWNER`.
3. Add an existing user by email or username.
4. Open Projects and create a project inside that organization.
5. Edit the project and confirm changes persist.

### Tasks

1. Create a task from the dashboard.
2. Move it between Kanban columns with drag and drop.
3. Switch between Kanban, Table, and Calendar.
4. Add and clear a due date.
5. Assign and remove users.
6. Archive a completed task and restore it from Archived Tasks.

### Progress Updates

1. Open a task.
2. Post a progress update.
3. Confirm it appears immediately.
4. Open the same task as another user and confirm realtime update delivery.

### Notes

1. Open the Notes workspace.
2. Create an organization-scoped note.
3. Create a project-linked note.
4. Search notes by title or content.
5. Edit and delete a note.
6. Open a task and create a linked note from the Related Notes section.
7. Close and reopen the task to confirm the linked note persists.

### Notifications

1. Trigger assignment, status, due date, and update notifications.
2. Confirm toast popup and dropdown entry both appear.
3. Mark one notification read.
4. Mark all as read.
5. Delete a read notification.

### Presence

1. Open the app in two sessions.
2. Confirm online users appear.
3. Open the same task in both sessions.
4. Confirm both viewers appear in the task panel.

## Current Status

### Completed

* authentication and JWT route protection
* signup without automatic organization creation
* organization onboarding V1
* project workspace foundation
* user identity endpoints and safe search
* create, update, assign, archive, and restore tasks
* multi-view Active Tasks workspace
* drag-and-drop Kanban
* realtime task synchronization
* due dates and overdue states
* task progress updates and notifications
* floating notification system
* lightweight presence
* notes workspace
* task-linked notes inside the task detail panel
* workspace memory via localStorage
* command palette

### Planned / Next Improvements

* richer note collaboration
* note comments
* note realtime collaboration
* fuller project hub workflows
* invite email delivery
* settings and profile expansion
* richer analytics and reporting
* mobile polish

## Author

Built by Philip Agne.
