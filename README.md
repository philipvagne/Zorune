# OpsFlow

OpsFlow is a real-time operational workspace for small teams that need tasks, project context, notes, team coordination, and presence in the same environment.

The product is intentionally moving away from stacked dashboard pages and toward a persistent workspace model:

- tasks remain the main execution surface
- deeper work opens inside a shared workspace area
- teams, projects, and notes behave like focused operational surfaces
- context is read-first and actions appear on demand

## Product Direction

OpsFlow is being shaped as a calmer operational canvas rather than a collection of disconnected admin pages.

Core principles:

- show information first
- show actions only when needed
- preserve context while moving between tasks, teams, projects, and notes
- keep scrolling local to the active surface whenever possible
- maintain workspace memory so users can return to where they were

## What Exists Today

The current app includes:

- JWT-based authentication
- a real-time task workspace
- team management
- project management
- linked notes across teams, projects, and tasks
- lightweight presence
- notifications
- recent work memory
- command palette search/open flows

## Workspace Model

OpsFlow has one primary work area and several contextual workspaces.

### Main Task Surface

The top work area is the live task execution surface. It supports:

- Kanban
- Table
- Calendar
- task creation
- task editing
- assignment
- due dates
- archive and restore
- real-time updates

### Context Workspaces

The lower shared workspace area can open:

- Teams
- Projects
- Notes
- Archived Tasks
- Profile
- Settings

These workspaces are converging on the same interaction model:

- persistent shell
- local tab memory
- two-pane or read-first layouts
- lightweight floating action windows
- internal scrolling inside the active surface

## Current Workspace Surfaces

### Teams Workspace

The Teams workspace is the current foundation for organization-level work. In the UI, the product uses the word `Team`, while the backend and schema still use `Organization`.

Current behavior includes:

- shared workspace shell
- left team collection pane
- right opened team surface
- tabs for `Overview`, `Projects`, `Members`, and `Settings`
- team creation
- team editing and deletion
- add and remove existing members
- member search and role filtering
- deep-open from Team Projects into the Projects workspace
- selected team persistence
- selected team tab persistence

### Projects Workspace

The Projects workspace is the most mature contextual workspace.

Current behavior includes:

- two-pane layout
- left pane for team selection and project list
- right opened project surface
- opened-project header
- tabs for `Overview`, `Tasks`, `Notes`, and `Members`
- project create, edit, and delete
- project-specific membership management
- project-scoped task creation
- project note creation and editing
- task deep-open from project tasks
- selected project persistence
- selected project tab persistence

### Notes Workspace

The Notes workspace is designed as operational memory, not a standalone document product.

Current behavior includes:

- note search
- note filtering by team, project, and task
- pinned and recent notes
- opened note reader surface
- project-linked notes
- task-linked notes
- note editing
- deep-open back into project or task context when available

### Archived Tasks

Archived tasks are soft-deleted through `archivedAt` and can be restored into active work.

## Cross-Workspace Continuity

OpsFlow now supports continuity between workspace surfaces.

Examples:

- Team -> Project deep-open
- Note -> Project deep-open
- Note -> Task deep-open
- Recent Work reopening tasks, teams, projects, and notes

Workspace state is persisted defensively:

- invalid selections are cleared
- deleted items should not reopen after refresh
- the app attempts to restore users to the last useful context safely

## Core Features

### Authentication

- register with email, password, username, and optional full name
- login with JWT
- protected API routes
- protected socket connections
- logout flow

### Teams

UI terminology uses `Team`, but internal data still uses `Organization`.

Supported today:

- create team
- view teams the current user belongs to
- edit team
- delete team
- add existing users to a team
- remove team members safely
- owner/admin-aware controls
- team member search and role filtering

### Projects

- projects belong to teams
- create project inside a team
- edit and delete project
- assign project members through `ProjectMembership`
- project overview with counts and operational summary
- project task list
- project notes

### Tasks

- create tasks inside projects
- assign multiple users
- task status flow: `TODO`, `IN_PROGRESS`, `DONE`
- due dates
- overdue awareness
- archive and restore
- drag-and-drop Kanban
- real-time task synchronization
- task updates / progress entries

### Notes

- team-level notes
- project-linked notes
- task-linked notes
- note editing and deletion
- note links
- task note read-state tracking
- project note pinning

### Notifications

- real-time notification delivery
- notification menu
- unread counts
- filtering
- mark read
- mark all read
- delete read notifications

### Presence

- online user presence
- task viewer presence
- lightweight shared awareness for currently viewed tasks

### Command Palette

Keyboard shortcuts:

- `Ctrl+K` on Windows/Linux
- `Cmd+K` on macOS

Current command palette coverage includes:

- open tasks
- open workspace views
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
- Passport JWT
- bcrypt

## Repository Structure

```txt
opsflow/
|-- apps/
|   `-- api/                  # NestJS backend
|       |-- prisma/           # Prisma schema and migrations
|       `-- src/              # API modules
|-- opsflow-dashboard/        # React frontend
|-- packages/                 # reserved shared package area
|-- docker-compose.yml        # local PostgreSQL
`-- README.md
```

Daily work mainly happens in:

- `apps/api`
- `opsflow-dashboard`

## Backend Modules

Current backend modules include:

- `auth`
- `users`
- `organizations`
- `projects`
- `tasks`
- `notes`
- `notifications`
- `prisma`

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

Important modeling decisions:

- `Membership` controls team/organization-level access
- `ProjectMembership` controls project membership without removing team-level access
- `Task` uses `archivedAt` for archive behavior
- `Note` belongs to an organization and can optionally link to a project and a task
- `TaskUpdate` is separate from `ActivityLog`
- `TaskNoteReadState` is used for unread note awareness on tasks

### Enums In Use

```txt
Role: OWNER, ADMIN, MEMBER, VIEWER
TaskStatus: TODO, IN_PROGRESS, DONE
NoteKind: NOTE, REFERENCE
```

## Realtime Architecture

OpsFlow uses Socket.IO for real-time coordination.

### Main Events

Task synchronization:

- `task_updated`

Task progress / updates:

- `task_update_created`

Notifications:

- `notification`

Presence:

- `presence_online_users`
- `task_viewing_join`
- `task_viewing_leave`
- `task_viewers_updated`

The current presence layer is intentionally lightweight and in-memory.

## API Overview

This is a practical frontend-facing view of the routes currently used by the app.

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

## 1. Start PostgreSQL

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

## 2. Start the Backend

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

Then run:

```bash
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

## 3. Start the Frontend

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
npm run build
npm run lint
npm run preview
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd run build
```

## Workspace Persistence

OpsFlow stores important workspace state in `localStorage`.

Examples:

- active workspace view
- active task view
- task filters
- selected task
- selected team in Projects
- selected project
- selected project tab
- selected team in Teams
- selected team tab
- selected note
- note search and note filters
- recent work history
- recent work panel open state

The persistence layer is intentionally defensive:

- invalid IDs are cleared
- deleted projects, notes, and teams should not reopen
- deep-open flows update the same stored keys used by the target workspace

## Recent Work

Recent Work is a local continuity feature, not an analytics system.

It currently tracks:

- tasks
- teams
- projects
- notes

Deep-open behavior from Recent Work:

- team -> opens Teams workspace
- project -> opens Projects workspace
- task -> opens task detail
- note -> opens Notes workspace

## UI Terminology

The frontend currently uses friendlier product language:

- `Team` instead of `Organization`
- `Teams` instead of `Organizations`

Important:

- backend modules still use organization naming
- Prisma models still use organization naming
- storage keys and API routes still use organization naming where already established

## Manual Testing Checklist

### Authentication

1. Register a user.
2. Log in.
3. Confirm the dashboard loads without errors.
4. Log out and back in.

### Teams

1. Create a team.
2. Confirm the creator becomes `OWNER`.
3. Open the Teams workspace and select different teams.
4. Edit a team.
5. Add an existing user to a team.
6. Search/filter members.
7. Remove a member.
8. Confirm the last owner/admin cannot be removed.
9. Delete a test team and confirm it disappears cleanly.

### Projects

1. Create a project inside a team.
2. Open it in the Projects workspace.
3. Edit the project.
4. Add and remove project members.
5. Open a project from Teams -> Projects and confirm deep-open works.
6. Delete a test project and confirm it does not reopen after refresh.

### Tasks

1. Create a task in a project.
2. Move it between Kanban columns.
3. Switch between Kanban, Table, and Calendar.
4. Assign and unassign users.
5. Set and clear a due date.
6. Archive and restore it.

### Notes

1. Create a team note.
2. Create a project-linked note.
3. Create a task-linked note.
4. Search notes.
5. Edit and delete a note.
6. Open linked project/task context from Notes.

### Realtime

1. Open the app in two sessions.
2. Open the same task in both sessions.
3. Update status or due date in one session and confirm the other session updates.
4. Confirm presence and notifications update appropriately.

## Contributor Notes

- treat workspaces as persistent operational surfaces, not isolated cards
- preserve read-first / action-on-demand behavior
- keep team/project/note continuity intact when changing deep-open behavior
- prefer lightweight local floating windows over introducing a global modal system
- keep backend access checks explicit and small when changing membership or deletion flows
- avoid breaking workspace persistence without a migration or cleanup path

## Current Status

Currently in place:

- real-time task execution surface
- team workspace shell and operational tab surfaces
- project workspace with scoped tasks, notes, and membership
- notes workspace for retrieval and context
- workspace continuity and recent work
- notifications and presence
- command palette

Likely next areas:

- richer project workflows
- deeper note collaboration
- broader settings/profile coverage
- more polish for cross-workspace consistency
- mobile and smaller-screen refinement

## Author

Built by Philip Agne.
