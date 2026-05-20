# OpsFlow Backend

A scalable SaaS-style task management backend built with NestJS, Prisma, PostgreSQL, and JWT authentication.

This project implements:

* multi-tenant organizations
* project management
* task workflows
* activity feeds
* notifications
* assignment system
* pagination & filtering
* secure role-based architecture foundations

---

# Tech Stack

* NestJS
* Prisma ORM
* PostgreSQL
* JWT Authentication
* TypeScript
* class-validator

---

# Features

## Authentication

* JWT login system
* Protected routes with guards
* User authentication middleware

---

## Organizations

* Multi-tenant organization structure
* Membership-based access control
* Organization project isolation

---

## Projects

* Create projects
* Organization-linked projects
* Secure membership validation

---

## Tasks

* Create tasks
* Update tasks
* Delete tasks
* Assign tasks to users
* Fetch user-specific tasks
* Pagination support
* Filtering support

---

## Task Workflow Engine

Supported workflow:

```txt
TODO → IN_PROGRESS → DONE
```

Invalid transitions are blocked automatically.

---

## Activity Feed System

Tracks:

* task status changes
* previous values
* new values
* actor/user attribution
* timestamps

Supports:

* pagination
* relational user data
* project-level audit history

---

## Notification System

Notifications are automatically created when:

* a task is assigned
* a task status changes

Includes:

* notification feed endpoint
* unread/read support foundation

---

# Architecture

```txt
Controller
   ↓
Service Layer
   ↓
Prisma ORM
   ↓
PostgreSQL
```

The application follows a layered architecture with separation of concerns between:

* controllers
* services
* database layer

---

# API Overview

## Auth

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

---

# Organizations

### Create Organization

```http
POST /organizations
```

---

# Projects

### Create Project

```http
POST /organizations/:orgId/projects
```

### Get Projects

```http
GET /organizations/:orgId/projects
```

---

# Tasks

### Create Task

```http
POST /organizations/:orgId/projects/:projectId/tasks
```

### Get Project Tasks

```http
GET /projects/:projectId/tasks
```

### Update Task

```http
PATCH /tasks/:taskId
```

### Delete Task

```http
DELETE /tasks/:taskId
```

### Assign Task

```http
PATCH /tasks/:taskId/assign
```

### Get My Tasks

```http
GET /tasks/my
```

Supports:

* pagination
* filtering by status
* filtering by projectId

Example:

```http
GET /tasks/my?status=TODO&page=1&limit=10
```

---

# Activity Feed

### Get Task Activity

```http
GET /tasks/:taskId/activity
```

Returns:

* status changes
* user info
* timestamps
* audit history

---

# Notifications

### Get Notifications

```http
GET /tasks/notifications
```

### Mark Notification As Read

```http
PATCH /notifications/:id/read
```

---

# Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/opsflow"
JWT_SECRET="your_secret"
```

---

# Prisma Setup

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

# Start Development Server

```bash
npm install
npm run start:dev
```

---

# Future Improvements

Planned upgrades:

* role-based permissions
* unread notification counters
* mark-all-as-read
* websocket real-time notifications
* email notifications
* event-driven architecture
* Prisma transactions
* Redis caching
* rate limiting
* Docker deployment
* CI/CD pipeline

---

# Author

Built as a scalable SaaS backend architecture learning project using modern backend engineering practices.
