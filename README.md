# OpsFlow

OpsFlow is a real-time collaborative project management workspace inspired by Linear, Jira, and ClickUp.

The project is a full-stack app with a NestJS API, Prisma/PostgreSQL database layer, React dashboard, JWT authentication, Socket.IO realtime updates, organization onboarding, multi-assignee tasks, due dates, task progress updates, notifications, presence, archive/restore, and multiple task views.

---

## Tech Stack

### Frontend

* React
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

---

## Project Structure

```txt
opsflow/
|-- apps/
|   `-- api/                 # NestJS backend
|       |-- prisma/          # Prisma schema and migrations
|       `-- src/             # API modules
|-- opsflow-dashboard/       # React frontend
|-- docker-compose.yml       # Local PostgreSQL service
`-- README.md
```

---

## Current Product Shape

OpsFlow now behaves as a persistent workspace application:

* Top bar for global actions
* Left rail for workspace navigation
* Center workspace for active task views
* Right rail for notifications and presence
* Docked context panel for task details and task creation

Active Tasks currently supports:

* Kanban view
* Table view
* Calendar agenda view

---

## Current Features

### Authentication

* User signup with full name, username, email, and password
* Signup creates only the user account
* New users can exist without an organization immediately after signup
* User login with JWT token response
* Protected backend routes
* Socket authentication through JWT
* Frontend login/signup UI with validation and loading states
* Logout flow that clears the stored token

### Organization Onboarding

* Users can view organizations they belong to
* Users with no organization see a safe empty state
* Users can create an organization from the dashboard
* Organization creator becomes `OWNER`
* Owners and admins can add existing users by email or username
* Members can be viewed per organization
* Duplicate memberships are prevented
* No email invite delivery yet

### Projects

* Projects belong to organizations
* Project access is scoped through organization membership
* Existing project APIs support project creation and project lookup
* Full project workspace UI is still planned

### User Identity Foundation

* `GET /users/me` returns the logged-in user's public profile
* `GET /users/search?q=` searches users by username, full name, or email
* User search is scoped to users who share an organization
* Search responses return only `id`, `email`, `username`, and `fullName`
* Password hashes and unnecessary user fields are never exposed

### Task Management

* Create tasks inside projects from the dashboard context panel
* Update task title, description, status, and due date
* Move tasks freely between `TODO`, `IN_PROGRESS`, and `DONE`
* Drag and drop task cards between Kanban columns
* Fetch only active, non-archived tasks assigned to the current user
* Activity logs are created for task status changes and archive/restore events
* Due dates can be added, changed, or cleared from the task panel
* Overdue tasks are visually highlighted when not complete

### Active Task Views

* Kanban view for status-based task movement
* Table view for scanning title, status, due date, assignees, and project
* Calendar agenda view grouped by due date
* Tasks without due dates appear in a separate calendar section
* Clicking a card, row, or calendar item opens the same docked task panel
* All views reuse the same live task state from `useTasks`

### Archive And Restore

* Completed `DONE` tasks can be archived
* Tasks are soft-archived with `archivedAt`
* Archived tasks disappear from Active Tasks immediately
* Archived tasks remain available in the Archived Tasks workspace
* Archived tasks can be restored
* Restored tasks become eligible to appear in Active Tasks again

### Multi-Assignee System

* Assign multiple users to one task
* Remove assignees from a task
* Assignment still supports raw user IDs
* Assignment UI also supports same-organization user search
* Assignment and removal emit realtime task updates to authorized users
* Assignment and removal create database notifications and websocket alerts

### Task Progress Updates

* Docked task panel includes a progress update timeline
* Users can post written task updates such as blockers, review notes, and completed work
* Progress updates are stored in a separate `TaskUpdate` model
* Updates include author identity and creation time
* Updates are delivered in realtime through `task_update_created`
* Progress update notifications are sent to assigned users except the author

### Notifications

* Realtime popup notifications through Socket.IO
* Notification dropdown with read/unread state
* Assignment notifications
* Removal/unassignment notifications
* Task status change notifications
* Task progress update notifications
* Due date added, changed, and cleared notifications
* Mark single notifications as read
* Mark all notifications as read
* Delete read notifications
* Unread notifications cannot be deleted

### Presence

* Online users are tracked in memory through the websocket gateway
* Right rail shows online users
* Opening a task panel emits task viewing presence
* The task panel shows users currently viewing the same task
* Presence is not persisted in the database

---

## Realtime Architecture

OpsFlow uses separate websocket events for task state, user alerts, task progress, and presence.

### `task_updated`

Used for active task state synchronization:

* status changes
* due date changes
* assignment changes
* avatar stack updates
* open task panel synchronization
* archived task removal from Active Tasks
* removing cards when the current user is no longer assigned

`task_updated` events are emitted to authorized user rooms instead of being broadcast globally.

### `task_update_created`

Used for user-written progress updates:

* appends a new progress update to an open task panel
* keeps collaborators viewing the same task in sync
* is scoped to authorized organization members

### `notification`

Used for user-facing alerts:

* toast popups
* notification dropdown updates
* assignment alerts
* unassignment alerts
* status change alerts
* due date alerts
* progress update alerts

The frontend keeps notification handling in `Dashboard.jsx`. `socket.js` only creates the socket connection.

### Presence Events

```txt
presence_online_users
task_viewing_join
task_viewing_leave
task_viewers_updated
```

Presence is lightweight V1 state kept in memory by the websocket gateway.

---

## Database Models

Core Prisma models:

* User
* Organization
* Membership
* Project
* Task
* TaskAssignment
* TaskUpdate
* ActivityLog
* Notification

`TaskUpdate` is separate from `ActivityLog` because it stores user-written collaboration updates. `ActivityLog` remains the foundation for system-generated audit history.

Tasks use `archivedAt` for soft archive behavior instead of hard deletion.

---

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
POST /organizations/:orgId/projects
GET  /organizations/:orgId/projects
GET  /projects/:projectId
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
```

### Notifications

```txt
GET    /tasks/notifications
PATCH  /notifications/:id/read
DELETE /notifications/:id
PATCH  /tasks/notifications/mark-all-read
```

---

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

Progress update and due date notifications are sent only to assigned users, excluding the user who performed the action.

---

## Local Development

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

The database runs on:

```txt
localhost:5432
```

Default local credentials from `docker-compose.yml`:

```txt
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

---

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

On this Windows machine, if PowerShell blocks `npm`, use:

```powershell
npm.cmd run build
```

---

## Manual Testing Checklist

### Authentication

1. Open the frontend.
2. Create an account with full name, username, email, and password.
3. Confirm login redirects to the dashboard.
4. Confirm the new user can have zero organizations without crashing the dashboard.
5. Logout and log back in.
6. Try invalid credentials and confirm a readable error appears.

### Organization Onboarding

1. Register or log in as a user with no organizations.
2. Open the Organizations workspace from the left rail.
3. Create an organization.
4. Confirm the creator appears as `OWNER`.
5. Add an existing user by email or username.
6. Log in as the added user and confirm the organization appears.
7. Confirm non-owner/non-admin users cannot add members.

### User Search And Assignment

1. Ensure two users share an organization.
2. Open a task panel.
3. Search by username, full name, or email.
4. Assign the searched user.
5. Confirm the assigned user receives a popup and dropdown notification.
6. Confirm avatars update in realtime.

### Active Task Views

1. Open Active Tasks.
2. Switch between Kanban, Table, and Calendar.
3. Click a Kanban card, table row, and calendar item.
4. Confirm each opens the docked task panel.
5. Change a due date and confirm Table and Calendar update without refetching manually.
6. Return to Kanban and confirm drag/drop still works.

### Realtime Removal

1. Open a task assigned to the current user.
2. Remove the current user from the task.
3. Confirm the card disappears instantly.
4. Refresh the page and confirm the card stays gone.
5. Remove another user while the current user remains assigned.
6. Confirm the task stays visible and avatars update.

### Status And Drag/Drop

1. Assign users to a task.
2. Drag the task between any status columns, including `DONE` back to `TODO`.
3. Confirm the status persists after refresh.
4. Confirm assigned users receive status change notifications.
5. Confirm the Kanban board and open task panel stay synchronized.

### Due Dates

1. Open a task panel.
2. Add a due date.
3. Confirm assigned users except the actor receive a due date added notification.
4. Change the due date.
5. Confirm assigned users except the actor receive a due date changed notification.
6. Clear the due date.
7. Confirm assigned users except the actor receive a due date cleared notification.
8. Refresh and confirm the persisted due date state is correct.
9. Set a past due date on an incomplete task and confirm overdue visuals appear in cards, table, and calendar.

### Task Progress Updates

1. Open a task panel.
2. Post a progress update.
3. Confirm the update appears in the timeline immediately.
4. Open the same task as another authorized organization member.
5. Post another update and confirm it appears in realtime.
6. Confirm assigned users except the author receive a popup and dropdown notification.
7. Confirm unauthorized users cannot fetch or post task updates.

### Archive And Restore

1. Move a task to `DONE`.
2. Archive the task from the task panel.
3. Confirm it disappears from Active Tasks instantly.
4. Refresh and confirm it stays hidden.
5. Open Archived Tasks.
6. Restore the task.
7. Return to Active Tasks and confirm it appears again if assigned to the current user.

### Notifications

1. Receive or create a notification.
2. Mark it as read.
3. Delete it from the dropdown.
4. Refresh and confirm it stays deleted.
5. Confirm unread notifications do not show a delete button and cannot be deleted by the API.

### Presence

1. Open the app in two browsers or two logged-in users.
2. Confirm online users appear in the right rail when allowed by scope.
3. Open the same task as both users.
4. Confirm both users appear in the task panel viewer list.
5. Close the panel and confirm the viewer list updates.

---

## Current Development Status

### Completed

* Authentication and signup/login UI
* JWT-protected API routes
* Signup without automatic organization creation
* Organization onboarding V1
* Organization member management V1
* Project management foundation
* User identity endpoints
* Same-organization user search
* Task creation from the dashboard context panel
* Task assignment and multi-assignee support
* Realtime Kanban synchronization
* Drag and drop Kanban task movement
* Table task view
* Calendar agenda task view
* Realtime notification system
* Docked task panel synchronization
* Lightweight online presence
* Task viewer presence
* Task activity log foundation
* Due date UI and backend support
* Due date notifications
* Task progress update timeline
* Realtime task progress updates
* Progress update notifications
* Task archive and restore
* Read notification deletion

### Planned / Next Improvements

* Full email invite flow
* Richer project workspace UI
* Profile and avatar management
* Task filtering and search
* Task comments evolving from progress updates
* Attachments
* Timeline view
* Richer calendar interactions
* Organization settings and roles management
* Analytics dashboard
* Mobile/responsive polish

---

## Author

Built by Philip Agne.
