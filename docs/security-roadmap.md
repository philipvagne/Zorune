# Security Roadmap

## Purpose

This document tracks security, authorization, authentication, validation, and hardening work for Zorune.

The goal is not enterprise-grade security.

The goal is to ensure the application demonstrates sound software engineering practices, proper authorization boundaries, secure defaults, and safe handling of user data.

---

# Security Audit Summary

Review completed: June 2026

Overall assessment:

* Architecture generally sound
* Organization scoping mostly enforced
* Global validation pipe enabled
* Environment files ignored by git

Primary findings:

1. Missing role-based write authorization
2. JWT secret fallback
3. Weak auth DTO validation
4. Missing login/register throttling
5. User directory privacy review

---

# Phase 1A — Authorization Hardening

## Status

Current Priority

## Finding

VIEWER users can mutate tasks and notes through direct API access.

## Risk

High

## Goal

Enforce role-based write permissions across all task and note mutation paths.

## Expected Outcome

VIEWER users:

* can read
* cannot create
* cannot edit
* cannot archive
* cannot restore
* cannot assign
* cannot modify notes

unless explicitly granted higher permissions.

## Planned Work

* Create centralized authorization helpers
* Define contributor-level permissions
* Define manager-level permissions
* Apply checks to task mutation endpoints
* Apply checks to note mutation endpoints
* Add regression tests

---

## Phase 1B — HTTP Authorization Regression Tests

Status: Next security follow-up.

Phase 1A implemented server-side contributor checks and unit coverage.

Remaining verification gap:
service-level tests do not fully prove real HTTP behavior across guards, controllers, DTOs, routing, and role handling.

Goal:
Add e2e/API regression tests proving:
- VIEWER receives 403 on task/note mutations
- MEMBER can perform valid mutations
- ADMIN and OWNER can perform valid mutations
- VIEWER can still read allowed data

---

# Phase 2 — JWT Secret Hardening

## Finding

JWT signing falls back to a hardcoded secret.

## Risk

High

## Goal

Fail closed when JWT_SECRET is missing.

## Planned Work

* Remove fallback secret
* Require JWT_SECRET through environment variables
* Prevent startup if secret is missing
* Document local development setup

---

# Phase 3 — Authentication Validation

## Finding

Auth endpoints use weak request validation.

## Risk

Medium

## Goal

Apply DTO-based validation consistently.

## Planned Work

* RegisterDto
* LoginDto
* Email validation
* Username constraints
* Password constraints
* Length limits

---

# Phase 4 — Authentication Abuse Protection

## Finding

No login/register throttling.

## Risk

Medium

## Goal

Reduce brute-force and password-spraying risk.

## Planned Work

* Rate limiting
* Login throttling
* Register throttling
* Logging repeated failures

---

# Phase 5 — User Directory Privacy Review

## Finding

Members can enumerate names/emails across shared organizations.

## Risk

Low

## Goal

Decide whether this behavior is intentional.

## Planned Work

* Review current user search behavior
* Decide desired privacy level
* Restrict returned fields if needed

---

# Success Criteria

The security roadmap is considered complete when:

* Authorization boundaries are enforced server-side
* JWT configuration fails closed
* Authentication endpoints use DTO validation
* Authentication abuse protection exists
* User directory exposure is intentionally designed

The goal is secure engineering fundamentals, not security theater.
