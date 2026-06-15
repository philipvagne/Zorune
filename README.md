# Zorune

Zorune is a real-time operations workspace for small teams. It combines task execution, team coordination, project context, notes, notifications, and lightweight presence in one interface instead of spreading work across disconnected admin pages.

The product is built around a persistent workspace model:

- tasks are the main execution surface
- teams, projects, and notes open as contextual workspaces
- state is remembered so users can return to where they were
- scrolling is kept local to the active surface where possible
- actions appear close to the context they affect

## What The App Includes

Current capabilities in the repository include:

- JWT authentication
- real-time task updates with Socket.IO
- Kanban, table, and calendar task views
- team management
- project management
- team, project, and task-linked notes
- archived task restore flows
- notifications and unread counts
- lightweight user presence
- recent work memory
- command palette navigation

## Product Areas

### Main task surface

The top workspace is the live task execution surface. It supports:

- task creation and editing
- assignment
- due dates
- status changes
- drag-and-drop Kanban
- archived tasks
- real-time synchronization

### Context workspaces

The shared lower workspace opens focused surfaces for:

- Teams
- Projects
- Notes
- Archived Tasks
- Profile
- Settings

These surfaces are converging on the same interaction model:

- persistent shell
- read-first layouts
- local view memory
- deep-open navigation between related entities

## Repository Layout

```txt
opsflow/
|-- apps/
|   `-- api/                  # NestJS backend + Prisma schema
|-- opsflow-dashboard/        # React + Vite frontend
|-- docker-compose.yml        # Local PostgreSQL service
`-- README.md
```

Daily work mainly happens in:

- `apps/api`
- `opsflow-dashboard`

## Tech Stack

### Frontend

- React 19
- Vite
- Axios
- Socket.IO Client
- dnd-kit
- react-hot-toast

### Backend

- NestJS 11
- Prisma ORM
- PostgreSQL
- Socket.IO
- Passport JWT
- bcrypt

## Backend Modules

The API is currently organized into these modules:

- `auth`
- `users`
- `organizations`
- `projects`
- `tasks`
- `notes`
- `notifications`
- `prisma`

## Data Model Snapshot

Important Prisma models include:

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

Important enums currently in use:

```txt
Role: OWNER, ADMIN, MEMBER, VIEWER
TaskStatus: TODO, IN_PROGRESS, DONE
NoteKind: NOTE, REFERENCE
```

Notable modeling decisions:

- team access is controlled through `Membership`
- project access is controlled through `ProjectMembership`
- tasks are archived with `archivedAt`
- notes belong to an organization and may optionally link to a project or task
- task note read state is stored separately for unread awareness

## Realtime Events

Zorune uses Socket.IO for live coordination. The main events currently used by the app include:

- `task_updated`
- `task_update_created`
- `notification`
- `presence_online_users`
- `task_viewing_join`
- `task_viewing_leave`
- `task_viewers_updated`

The current presence model is intentionally lightweight and in-memory.

## API Surface

This is a practical frontend-facing summary of the main routes used today.

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

### Organizations / Teams

```txt
GET    /organizations/my
POST   /organizations
GET    /organizations/:orgId
PATCH  /organizations/:orgId
DELETE /organizations/:orgId
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

Supported note query patterns:

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

## Local Development

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

Default database values:

```txt
host: localhost
port: 5432
user: postgres
password: postgres
database: opsflow
```

### 2. Start the backend

```bash
cd apps/api
npm install
```

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/opsflow
JWT_SECRET=replace_me
PORT=3000
```

Run migrations and start the API:

```bash
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

### 3. Start the frontend

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
npm run test:e2e
npx prisma studio
```

### Frontend

```bash
cd opsflow-dashboard
npm run dev
npm run build
npm run preview
npm run lint
```

## Current Notes

- UI terminology uses `Team`, while parts of the backend and Prisma schema still use `Organization`
- the frontend and backend are versioned together in this repository
- there is no root app script; frontend and backend run from their own folders

## Status

Zorune is an actively evolving workspace product rather than a frozen template. Expect ongoing UI refinements, workspace model adjustments, and continued convergence across Teams, Projects, Notes, and task execution flows.
