# Decisions

This document records important product and architecture decisions for Zorune.

## Workspace Architecture

### Decision

The workspace frame is the protected lower-center product surface.

### Reason

All major work surfaces should feel like they live inside the same stable workspace instead of opening unrelated pages or disconnected panels.

---

## Teams Workspace

### Decision

Teams Workspace is the current visual and structural reference implementation.

### Reason

The Teams shell, left rail, and Overview tab are the most mature workspace surfaces in the product.

---

## Shared Workspace Primitives

### Decision

Shared layout primitives use `workspace-*`.

### Reason

Previously, Teams borrowed hidden `project-*` classes. This caused unclear ownership and made small changes risky.

---

## Notes

### Decision

Notes should live mainly inside project and task context rather than as a large standalone workspace.

### Reason

A full Notes workspace could become noisy and chat-like. Notes should support work, not become another attention surface.

---

## Notifications

### Decision

Notifications V1 uses a simple unseen/seen model.

### Reason

Notifications should surface important attention items, not become a management system with filters, categories, or complex priority handling.

---

## Product Philosophy

### Decision

Zorune should avoid unnecessary complexity even if more features seem possible.

### Reason

The product direction is calm, useful, and focused. More functionality is not automatically better.
