# 🚀 OpsFlow API

A backend API built with **NestJS + PostgreSQL + Prisma** implementing a SaaS-ready authentication system with multi-tenant organization structure.

---

## 🧠 Overview

OpsFlow is a backend system designed as a foundation for SaaS applications.  
It includes authentication, organization management, and role-based membership structure from the start.

This project follows real-world backend architecture patterns used in modern SaaS products.

---

## ⚙️ Tech Stack

- **Backend Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Language:** TypeScript

---

## 🏗️ Architecture (Current Phase)

The system is built around a multi-tenant SaaS model:

### Core Entities

- **User**
- **Organization**
- **Membership**

### Relationship Model

- A User can belong to multiple Organizations
- Each Membership defines a role (OWNER, MEMBER)
- Each Organization is isolated (multi-tenancy ready)

---

## 🔐 Authentication System

Implemented features:

### Auth Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protected)

### Features

- User registration with automatic:
  - Organization creation
  - Membership assignment (OWNER role)
- Secure password hashing (bcrypt)
- JWT-based authentication
- Protected routes via JWT Guard

---

## 🔑 Current Features

### ✅ Completed
- NestJS project setup
- PostgreSQL database integration
- Prisma ORM setup + migrations
- User / Organization / Membership schema
- Authentication system (register + login)
- JWT token generation & validation
- Protected `/auth/me` endpoint
- Git versioning with milestone commits

---

```bash
git add README.md
git commit -m "docs: update project status with completed auth system"
git push

---

## Roadmap

- RBAC permissions
- Project management domain
- Task workflows
- Realtime collaboration
- Frontend dashboard
- Audit logging

---

## Vision

OpsFlow aims to become a full-stack SaaS operations platform for managing teams, workflows, and organization-level collaboration.
