# AGENTS.md

## Project

Zorune is a collaborative workspace platform for projects, tasks, notes, and team organization.

The goal is to help individuals and small teams manage work in a calmer and more organized way without introducing unnecessary complexity.

---

## Core Philosophy

Reduce chaos faster than complexity is added.

Powerful underneath. Quiet on the surface.

Every feature should provide more value than complexity.

If a feature creates confusion, maintenance burden, or workflow friction without a clear benefit, it should be simplified, postponed, or removed.

---

## Product Principles

Prioritize clarity over feature count.

Prioritize usability over technical cleverness.

Prefer a small number of well-executed workflows over many partially finished workflows.

Avoid dashboard bloat.

Avoid unnecessary settings and configuration.

Avoid features that exist only because competitors have them.

---

## Design Principles

The UI should feel:

* Calm
* Professional
* Minimal
* Structured
* Easy to understand

Use whitespace intentionally.

Avoid visual noise.

Avoid excessive colors, badges, alerts, or animations.

The product should feel productive, not overwhelming.

---

## Development Principles

Favor maintainability over short-term speed.

Prefer simple solutions over complex abstractions.

Do not introduce dependencies without a clear reason.

When adding functionality:

1. Explain why the feature is needed.
2. Explain how it supports the product philosophy.
3. Keep implementation as simple as possible.

---

## Technical Stack

### Frontend

* React
* Vite
* Axios
* Socket.IO Client

### Backend

* NestJS
* Prisma ORM
* PostgreSQL
* Socket.IO
* JWT Authentication

---

## Current Priorities

1. Recent Activity experience
2. Notifications experience
3. Workspace UX improvements
4. Product consistency
5. Codebase maintainability

---

## AI Agent Instructions

Before proposing a new feature, ask:

* Does this reduce chaos?
* Does this improve the user workflow?
* Is there a simpler solution?
* Does it fit the existing design language?
* Will this still make sense six months from now?

If the answer is no, do not recommend the feature.

Favor refinement and quality over feature expansion.

---

## Current Product State

Implemented

- Authentication
- Organizations
- Projects
- Tasks
- Notes
- Notifications
- Team Workspaces
- Role-Based Access Control
- Real-time Updates

Current Focus

- Recent Activity UX
- Notifications UX
- Workspace Refinement
- Product Consistency
- Codebase Maintainability

Not Yet Implemented

- Advanced Automations
- Integrations
- Public APIs
- Mobile Experience

---

## Simplicity Filter

Before introducing a new feature:

1. What problem does this solve?
2. Can the same problem be solved with an existing workflow?
3. Is there a smaller version worth building first?
4. Does the value outweigh the added complexity?

If uncertain, choose the simpler solution.