# OpsFlow

OpsFlow is a real-time operational workspace for teams that need tasks, context, presence, and coordination in the same environment.

The product is intentionally moving away from stacked dashboard pages and toward a persistent workspace model:

- Active Tasks stays visible as the main execution surface.
- Secondary workspaces open inside the shared context area.
- Projects and Organizations behave like focused operational surfaces instead of separate mini-products.
- Notes capture the "why", "how", and "what to remember" behind work.

## What OpsFlow Is Today

OpsFlow currently combines:

- a NestJS backend
- Prisma ORM with PostgreSQL
- a React 19 + Vite frontend
- JWT authentication
- Socket.IO realtime updates
- workspace persistence through `localStorage`
- organizations, projects, tasks, notes, notifications, and lightweight presence

## Product Model

OpsFlow is organized around one main execution layer and several contextual workspaces.

### Main Workspace

The main workspace is the live tasks surface. It supports:

- Kanban
- Table
- Calendar agenda view
- filtering
- sorting
- task creation
- task detail
- realtime task updates

### Context Workspaces

The lower context workspace can open:

- Archived Tasks
- Projects
- Notes
- Organizations
- Settings
- Profile

Each workspace is evolving toward the same design philosophy:

- read-first
- action-on-demand
- calmer two-pane surfaces
- internal scrolling instead of long dashboard pages
- persistent selection and tab memory

## Current Workspace Areas

### Projects Workspace

The Projects workspace is the most mature contextual surface right now. It includes:

- two-pane layout
- left collection pane for organizations and project list
- right opened project surface
- opened-project header
- tabs for `Overview`, `Tasks`, `Notes`, and `Members`
- project-scoped task creation
- project note creation and editing
- project member add/remove
- project edit and delete
- centered local popup interactions
- selected project persistence
- selected project tab persistence

### Organizations Workspace

The Organizations workspace now follows the same operational pattern. It includes:

- two-pane layout
- left organization collection pane
- right opened organization surface
- tabs for `Overview`, `Members`, `Projects`, and `Settings`
- organization creation through centered popup
- organization member add/remove
- organization search and role filter in Members
- organization edit and delete from Settings
- deep-open from organization project list into the Projects workspace
- selected organization persistence
- selected organization tab persistence

### Notes Workspace

The Notes workspace supports:

- organization-scoped notes
- project-linked notes
- task-linked notes
- note search
- note editing
- note linking

### Archived Tasks

Archived tasks are soft-deleted through `archivedAt` and can be restored.

## Core Features

### Authentication

- user registration with full name, username, email, and password
- login with JWT
- protected backend routes
- socket authentication with JWT
- logout flow
- users can exist before joining an organization

### Organizations

- create organizations
- creator becomes `OWNER`
- view organizations the current user belongs to
- read-first organization workspace
- add existing users by email or username
- remove organization members safely
- update organization name and slug
- delete organizations safely
- membership-based access control

### Projects

- projects belong to organizations
- create projects inside an organization
- edit and delete projects
- project member management through `ProjectMembership`
- project task counts
- project notes
- project-scoped task creation
- selected project memory

### Tasks

- create tasks inside projects
- multi-assignee tasks
- task status flow: `TODO`, `IN_PROGRESS`, `DONE`
- due dates
- overdue highlighting
- archive and restore
- drag-and-drop Kanban
- realtime updates
- task activity and progress updates

### Notes

- organization notes
- project-linked notes
- task-linked notes
- note editing and deletion
- note links
- project note pinning
- task note awareness

### Notifications

- realtime toast notifications
- notification dropdown
- unread count
- notification filters
- mark one as read
- mark all as read
- delete notification

### Presence

- online users
- lightweight task viewer presence
- shared task viewer list in the task panel

### Command Palette

Keyboard shortcut:

- `Ctrl+K` on Windows/Linux
- `Cmd+K` on macOS

Current actions:

- jump between workspace views
- open tasks
- create a task

## Tech Stack

### Frontend

- React 19
- Vite
- Axios
- Socket.IO Client
- React Hot Toast
- dnd-kit

### Backend

- NestJS 11
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT authentication

## Repository Structure

```txt
opsflow/
|-- apps/
|   `-- api/                     # NestJS backend
|       |-- prisma/              # Prisma schema and migrations
|       `-- src/                 # API modules
|-- opsflow-dashboard/           # React frontend
|-- packages/                    # Reserved shared package area
|-- docker-compose.yml           # Local PostgreSQL
`-- README.md
```

There is no root application package to run directly. Day-to-day work happens in:

- `apps/api`
- `opsflow-dashboard`

## Data Model

Important Prisma models currently include:

- `User`
- `Organization`
- `Membership`
- `Project`
- `ProjectMembership`
- `Task`
- `TaskAssignment`
- `TaskUpdate`
- `ActivityLog`
- `Notification`
- `Note`
- `NoteLink`
- `TaskNoteReadState`

Key modeling choices:

- `Membership` controls organization-level access.
- `ProjectMembership` controls project membership while preserving organization access.
- `TaskUpdate` is separate from `ActivityLog`.
- `Task` uses `archivedAt` for soft archive behavior.
- `Note` belongs to an organization and can optionally link to a project and a task.

## Realtime Architecture

OpsFlow separates realtime task state, notifications, updates, and presence.

### Task Synchronization

`task_updated` is used for:

- status changes
- due date changes
- assignment changes
- archive and restore changes
- keeping open task detail synchronized
- updating project task lists without full refetch

### Task Progress Updates

`task_update_created` is used for:

- user-written task progress updates
- appending updates to open task panels
- collaborative task progress visibility

### Notifications

`notification` is used for:

- toast popups
- dropdown updates
- unread count updates

### Presence Events

```txt
presence_online_users
task_viewing_join
task_viewing_leave
task_viewers_updated
```

Presence is intentionally lightweight and in-memory for now.

## API Overview

This is a practical overview of the main routes the frontend currently relies on.

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
GET    /organizations/my
POST   /organizations
PATCH  /organizations/:orgId
DELETE /organizations/:orgId
GET    /organizations/:orgId
GET    /organizations/:orgId/members
POST   /organizations/:orgId/members
DELETE /organizations/:orgId/members/:membershipId
```

### Projects

```txt
GET    /organizations/:orgId/projects
POST   /organizations/:orgId/projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
POST   /projects/:projectId/members
DELETE /projects/:projectId/members/:membershipId
GET    /projects/:projectId/tasks
```

### Tasks

```txt
POST   /organizations/:orgId/projects/:projectId/tasks
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
PATCH  /tasks/:taskId/notes/seen
```

### Notes

```txt
GET    /notes
POST   /notes
GET    /notes/:noteId
PATCH  /notes/:noteId
DELETE /notes/:noteId
GET    /notes/:noteId/links
POST   /notes/:noteId/links
DELETE /notes/:noteId/links/:linkedNoteId
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

Current notification coverage includes:

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

## 1. Start PostgreSQL

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

## 2. Backend Setup

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
npx prisma generate
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

## 3. Frontend Setup

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

## Workspace Persistence

OpsFlow persists key workspace state in `localStorage`.

Examples include:

- active workspace view
- active task layout
- task filters
- selected task
- selected organization in Projects
- selected project
- selected project tab
- selected organization in Organizations
- selected organization tab
- recent work panels and history

This persistence is best-effort and defensive:

- invalid selections are cleared when the underlying item no longer exists
- deleted projects and organizations should not reopen after refresh

## Manual Testing Checklist

### Authentication

1. Register a new user.
2. Log in and confirm the dashboard loads.
3. Log out and log back in.
4. Confirm a user with no organizations does not crash the app.

### Organizations

1. Create an organization.
2. Confirm the creator becomes `OWNER`.
3. Open the Organizations workspace and confirm the organization appears in the left pane.
4. Edit the organization name and slug.
5. Add an existing user by email or username.
6. Search and filter members by role.
7. Remove a member and confirm the list updates immediately.
8. Confirm the last owner/admin cannot be removed.
9. Delete a test organization and confirm it disappears cleanly.

### Projects

1. Open Projects and create a project inside an organization.
2. Confirm the project appears in the organization project list and the Projects workspace.
3. Edit the project.
4. Add and remove project members.
5. Delete a test project and confirm it disappears without reopening after refresh.
6. Open a project from Organizations -> Projects and confirm the Projects workspace opens that exact project.

### Tasks

1. Create a task in a project.
2. Move it between Kanban columns with drag and drop.
3. Switch between Kanban, Table, and Calendar.
4. Add and clear a due date.
5. Assign and remove users.
6. Archive a completed task and restore it from Archived Tasks.

### Notes

1. Open the Notes workspace.
2. Create an organization note.
3. Create a project-linked note.
4. Search notes by title or content.
5. Edit and delete a note.
6. Open a task and create a linked note from the task context.

### Realtime And Presence

1. Open the app in two sessions.
2. Confirm online users appear.
3. Open the same task in both sessions.
4. Confirm both viewers appear in the task panel.
5. Update task status or due date in one session and confirm the other session updates.

### Notifications

1. Trigger assignment, status, due date, and update notifications.
2. Confirm toast popup and dropdown entry both appear.
3. Mark one notification as read.
4. Mark all as read.
5. Delete a read notification.

## Current Status

### Completed

- JWT authentication and protected routes
- user onboarding without forced organization creation
- organization creation, edit, delete, and membership management
- project workspace foundation with member management
- project-scoped notes and tasks
- project and organization popup interaction patterns
- active task workspace with three views
- drag-and-drop Kanban
- task assignment, due dates, archive, and restore
- realtime task synchronization
- task updates and notifications
- notes workspace and linked notes
- lightweight presence
- command palette
- recent work memory

### In Progress / Likely Next

- richer project workflows
- deeper organization settings
- more note collaboration tooling
- expanded reporting and analytics
- mobile polish
- more complete profile and settings surfaces

## Notes For Contributors

- Prefer treating workspaces as persistent operational surfaces, not isolated dashboard cards.
- Preserve read-first / action-on-demand behavior when extending Projects and Organizations.
- Reuse the existing centered local popup pattern instead of introducing a global modal system unless there is a clear reason.
- Keep backend changes small and access-check aware.

## Author

Built by Philip Agne.
