# 🚀 OpsFlow API

A SaaS-ready backend API built with **NestJS**, **PostgreSQL**, and **Prisma** implementing authentication, RBAC authorization, and secure multi-tenant organization architecture.

---

# 🧠 Overview

OpsFlow is a backend system designed as the foundation for a scalable SaaS platform.

The project focuses on implementing real-world backend architecture patterns used in production applications, including:

- JWT authentication
- Role-based access control (RBAC)
- Multi-tenant organization structure
- Tenant-isolated API access
- Modular domain architecture

The goal is to build a portfolio-grade backend demonstrating how modern SaaS systems are structured internally.

---

# ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| TypeScript | Application language |
| PostgreSQL | Relational database |
| Prisma ORM | Database ORM + migrations |
| JWT | Authentication |
| bcrypt | Password hashing |
| Docker | Local database container |

---

# 🏗️ Current Architecture

The system currently follows a multi-tenant SaaS structure.

## Core Entities

### User
Represents authenticated platform users.

### Organization
Represents isolated workspaces/tenants.

### Membership
Join table connecting users to organizations with roles.

---

# 🔗 Entity Relationships

```text
User
 └── Membership
       └── Organization

---

# 📁 Current Project Structure

src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt-auth.guard.ts
│   ├── roles.decorator.ts
│   └── roles.guard.ts
│
├── organizations/
│   ├── organizations.controller.ts
│   ├── organizations.service.ts
│   └── organizations.module.ts
│
├── prisma/
│   └── schema.prisma

---

# 🧭 Architectural Principles

The project is intentionally structured around:

- modular backend domains
- service/controller separation
- scalable SaaS architecture
- secure tenant isolation
- incremental feature development

---

# 🚀 Roadmap
Next Planned Features

# Projects Domain
- organization projects
- project ownership
- project membership

# Tasks System
- task assignment
- task status
- due dates
- comments

# Advanced Authorization
- organization-level permissions
- project-level permissions
- granular RBAC

# Backend Improvements
- DTO validation
- centralized error handling
- Prisma service abstraction
- refresh tokens
- testing strategy

# Frontend
- Next.js frontend
- dashboard UI
- authentication pages
- organization switching

---

# 📌 Project Purpose

OpsFlow is being built as a portfolio-grade backend engineering project focused on:

SaaS backend architecture
authentication & authorization
multi-tenant systems
scalable NestJS structure
production-style backend patterns

---

# 👨‍💻 Author

Built as a learning and portfolio project focused on real-world backend engineering and scalable SaaS architecture.