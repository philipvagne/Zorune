# OpsFlow

OpsFlow is a full-stack realtime project management and operations platform built with modern web technologies.

The platform includes:

* JWT Authentication
* Project management
* Task management
* Realtime Kanban board
* WebSocket notifications
* Live task assignment updates
* Activity logging
* PostgreSQL database integration
* Prisma ORM
* React frontend
* NestJS backend

---

# Tech Stack

## Frontend

* React
* Axios
* Socket.IO Client

## Backend

* NestJS
* Prisma ORM
* Socket.IO
* JWT Authentication

## Database

* PostgreSQL

---

# Features

## Authentication

* User registration
* User login
* JWT protected routes

## Projects

* Create projects
* Organize tasks by project

## Tasks

* Create tasks
* Assign tasks to users
* Update task statuses
* Task descriptions
* Task activity tracking

## Kanban Board

* TODO column
* IN_PROGRESS column
* DONE column
* Live realtime updates

## Notifications

* Realtime task assignment notifications
* Unread notification counter
* Mark notifications as read
* Live notification dropdown

## Realtime Sync

* WebSocket powered updates
* Instant Kanban synchronization
* Live task assignment updates
* Realtime modal updates

---

# Architecture

OpsFlow uses a monorepo structure:

```txt
opsflow/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # React frontend
├── prisma/
├── package.json
└── README.md
```

---

# Environment Variables

## Backend (.env)

Create:

```txt
apps/api/.env
```

Add:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/opsflow"
JWT_SECRET="your_jwt_secret"
PORT=3000
```

---

## Frontend (.env)

Create:

```txt
apps/web/.env
```

Add:

```env
VITE_API_URL=http://localhost:3000
```

---

# Installation

## 1. Clone Repository

```bash
git clone <your-repository-url>
cd opsflow
```

---

## 2. Install Dependencies

```bash
npm install
```

---

# Database Setup

## Run Prisma Migrations

```bash
npx prisma migrate dev
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Open Prisma Studio

```bash
npx prisma studio
```

---

# Running The Application

## Start Backend

```bash
cd apps/api
npm run start:dev
```

Backend runs on:

```txt
http://localhost:3000
```

---

## Start Frontend

```bash
cd apps/web
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# Prisma Commands

## Run Migrations

```bash
npx prisma migrate dev
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Open Prisma Studio

```bash
npx prisma studio
```

---

## Reset Database

```bash
npx prisma migrate reset
```

---

# Realtime System

OpsFlow uses Socket.IO for realtime communication.

Current realtime functionality includes:

| Feature                   | Status |
| ------------------------- | ------ |
| Realtime notifications    | ✅      |
| Live Kanban updates       | ✅      |
| Task assignment sync      | ✅      |
| Realtime modal sync       | ✅      |
| Notification unread count | ✅      |

---

# Current Application Features

## Fully Working

* JWT Authentication
* Protected routes
* Task CRUD
* Project structure
* Realtime notifications
* Realtime Kanban board
* Task assignment
* Prisma/PostgreSQL integration
* Socket.IO synchronization

---

# Future Improvements

Planned future features:

* Drag & drop Kanban
* User avatars
* Team management
* File uploads
* Comments system
* Role permissions
* Search & filtering
* Mobile responsiveness
* Email notifications
* Analytics dashboard
* Dark mode

---

# Development Notes

## Backend

The backend follows a modular NestJS architecture.

Main modules:

* Auth
* Users
* Projects
* Tasks
* Notifications
* WebSocket Gateway

---

## Frontend

The frontend uses React functional components and hooks.

Main systems:

* Dashboard
* Kanban Board
* Notification System
* Task Modal
* Socket Synchronization

---

# Realtime Architecture

The backend emits a unified:

```txt
notification
```

WebSocket event.

The frontend branches behavior using:

```txt
notification.type
```

Example:

```txt
TASK_ASSIGNED
```

This architecture keeps realtime logic centralized and scalable.

---

# Author

Built using:

* React
* NestJS
* Prisma
* PostgreSQL
* Socket.IO

by Philip.
