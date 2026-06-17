# Workspace Refactor Plan

## Status

Current state:
- Workspace system functions correctly
- Teams Workspace frame is approved and protected
- Shared workspace primitives exist but ownership is unclear
- Small changes currently create unexpected regressions

Current goal:
Create a clean, maintainable workspace architecture before continuing major feature development.

---

## Core Problem

The architecture is not suffering from too much reuse.

The architecture is suffering from unclear ownership of reuse.

### Symptoms

- Teams depends on project-* classes
- Small UI changes create unrelated regressions
- Shared layout primitives are hidden behind project-* naming
- Dashboard owns too much workspace composition logic
- Future maintenance is becoming expensive

---

## Workspace Inventory

### Collection Workspaces

- Teams
- Projects
- Notes
- Archive

### Form Workspaces

- Create Task

### Detail Workspaces

- Active Task

### Account / System Workspaces

- Profile
- Settings

---

## Current Architecture

### Shared Workspace Shell

- dashboard-workspace-shell
- workspace-card-shell
- workspace-card-body

### Shared Layout Primitives

Current shared primitives:

- project-detail-content
- project-surface-tabs
- project-surface-tab
- project-surface-section
- project-surface-section-header
- project-form
- project-workspace-popup-*

### Problem

These are functioning as generic workspace primitives even though they are named project-*.

## Frozen Shared Primitives - Current State

This section freezes the current shared workspace primitives as they exist today.

They should be treated as protected cross-surface dependencies until a later migration introduces explicit `workspace-*` ownership.

No one should rename, split, or restyle these primitives casually during feature work.

| Current class name | Current role | Surfaces affected | Risk level | Eventually become `workspace-*` primitive |
| --- | --- | --- | --- | --- |
| `dashboard-center-workspace` | Main center-stage host that holds the board surface and optional context workspace side-by-side. | `Dashboard.jsx`, `CenterWorkspace.jsx` | Medium | Keep as-is or fold into a top-level `workspace-shell` layer later |
| `dashboard-workspace-shell` | Dashboard context-panel modifier that turns the right side into the protected workspace region. | `Dashboard.jsx`, context-panel workspace rendering | High | Yes |
| `workspace-card-shell` | Shared outer frame wrapper for workspace surfaces rendered inside the protected frame. Used by task detail, create task, and workspace cards. | `Dashboard.jsx`, `TaskModal.jsx`, `CreateTaskPanel.jsx` | High | Already in the right naming family; keep and formalize |
| `workspace-card-body` | Shared inner body wrapper that constrains workspace content and participates in height/scroll behavior. | `Dashboard.jsx`, `TaskModal.jsx`, `CreateTaskPanel.jsx`, Teams/Projects mounting surfaces | High | Already in the right naming family; keep and formalize |
| `project-panel` | Generic two-column workspace panel base, even though it is named for Projects. It provides the panel box model used by both Teams and Projects. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-collection-pane` | Left collection rail primitive for collection-style workspaces. It is currently the collection rail implementation for Projects and informs the Teams structure. | `ProjectsWorkspace.jsx`, related shared CSS used as the collection reference | Medium | Yes |
| `project-detail-panel` | Right detail-pane primitive for collection workspaces. It currently behaves as a generic detail container and is also attached to Teams. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-collection-body` | Shared vertical stack primitive inside the left collection rail. Controls header/controls/list composition. | `ProjectsWorkspace.jsx`, indirectly mirrored by Teams | Medium | Yes |
| `project-detail-content` | Shared content wrapper below the detail header/tabs. This is one of the most fragile hidden primitives because scroll ownership and tab-body sizing depend on it. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Critical | Yes |
| `project-list-panel` | Shared list-region primitive for collection rails. Teams uses it directly via `project-list-panel organization-list-panel`. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-card-grid` | Shared scroll/list stack primitive for collection cards. Teams depends on it directly via `project-card-grid organization-card-grid`. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-card` | Shared clickable collection-item primitive used as the base card/button for both project items and team items. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Medium | Yes |
| `project-count-row` | Shared compact metadata row under collection titles. Teams uses it directly for project/member counts. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Low | Optional |
| `project-opened-strip` | Shared detail-header strip primitive used to present the currently opened entity in detail surfaces. Teams styles against this pattern even when not always rendering the strip itself. | `ProjectsWorkspace.jsx`, Teams-specific CSS overrides in `App.css` | Medium | Yes |
| `project-opened-tab` | Shared opened-entity identity pill inside detail surfaces. Teams overrides its appearance through descendant selectors. | `ProjectsWorkspace.jsx`, Teams-specific CSS overrides in `App.css` | Medium | Yes |
| `project-opened-tab-main` | Shared inner layout wrapper for the opened-entity pill content. | `ProjectsWorkspace.jsx`, Teams-specific CSS overrides in `App.css` | Low | Optional |
| `project-opened-tab-icon` | Shared identity/icon primitive used in both Projects and Teams detail headers. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Medium | Yes |
| `project-opened-tab-copy` / `project-opened-tab-label` / `project-opened-tab-close` | Shared copy/label/close affordance primitives for opened-entity detail header UI. | `ProjectsWorkspace.jsx`, Teams-specific CSS overrides in `App.css` | Medium | Yes |
| `project-surface-tabs` | Shared tab-row primitive across collection-style detail surfaces. Teams depends on this directly for Overview/Members/Projects/Settings. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Critical | Yes |
| `project-surface-tab` | Shared individual tab button primitive. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-surface-section` | Shared tab-body section primitive below the tabs. Teams Members, Projects, and Settings all use this directly. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Critical | Yes |
| `project-surface-section-header` | Shared section header primitive inside tab content. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-surface-description` | Shared body copy primitive used inside overview/detail sections. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Low | Optional |
| `project-overview-surface` | Shared overview-surface primitive. Teams Overview depends on this directly even though the content is not a Project overview. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Critical | Yes |
| `project-members-surface` | Shared member-surface primitive. Teams Members currently layers on top of this class. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-tasks-surface` / `project-notes-surface` | Shared task/note surface primitives used inside Projects and as the pattern reference for future normalized task/note workspaces. | `ProjectsWorkspace.jsx` | Medium | Yes |
| `project-tasks-list-shell` / `project-notes-list-shell` / `project-members-list-shell` | Shared inner scroll-shell primitives for tab bodies. These are important because they currently participate in scroll ownership decisions. | `ProjectsWorkspace.jsx`, conceptually mirrored by Teams list-shell overrides | High | Yes |
| `project-member-avatar` / `project-member-avatar-large` / `project-member-copy` / `project-member-role` | Shared member-row building blocks that leak into Teams member rendering. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Medium | Optional, but likely yes as member primitives |
| `project-form` | Shared form surface primitive used for project forms, team popups, and multiple workspace overlays. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `project-workspace-popup-layer` / `project-workspace-popup-backdrop` / `project-workspace-popup-shell` | Shared popup-layer primitives that Teams still composes with newer `workspace-floating-window-*` classes. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | High | Yes |
| `workspace-floating-window-*` and `workspace-action-popup*` | Already-neutral popup/window primitives that now sit beside older `project-workspace-popup-*` classes. This is a transitional shared primitive cluster rather than a fully normalized system. | `OrganizationsWorkspace.jsx`, `ProjectsWorkspace.jsx` | Medium | Keep and formalize |
| `task-detail-panel` | Shared task/detail panel primitive used by both Active Task and Create Task. It is task-named but currently functions as a generic single-surface detail/form panel. | `TaskModal.jsx`, `CreateTaskPanel.jsx` | Medium | Probably, via a later `workspace-detail-panel` or `workspace-form-panel` |
| `task-detail-header` | Shared header primitive used by both Active Task and Create Task. | `TaskModal.jsx`, `CreateTaskPanel.jsx` | Low | Optional |
| `task-detail-scroll` | Shared internal scroll container for task detail surfaces. Important for the protected-frame contract. | `TaskModal.jsx` | Medium | Yes, if task/detail surfaces are normalized |
| `task-create-form`, `task-create-form-body`, `task-create-form-actions` | Shared create-surface form scaffolding inside the protected frame. | `CreateTaskPanel.jsx` | Low | Optional, likely later form primitives |

### Frozen current-state guidance

- Teams currently depends on multiple `project-*` classes as hidden generic primitives.
- Projects is the original owner in name only, not in actual architectural scope.
- Task detail and Create Task already rely on `workspace-card-*` and `task-*` primitives that participate in the same protected frame contract.
- Popup and overlay behavior is currently split between older `project-workspace-popup-*` names and newer `workspace-floating-window-*` names.
- The highest-risk primitives are the ones that control frame sizing, detail-pane sizing, tab layout, and scroll ownership.
- Phase 2 should introduce neutral aliases before any attempt to detach Teams from `project-*` classes.

---

## Target Architecture

Dashboard
└── ContextPanel
    └── WorkspaceShell
        ├── Teams
        ├── Projects
        ├── Notes
        ├── Archive
        ├── Active Task
        ├── Create Task
        ├── Profile
        └── Settings

### Shared Workspace Primitives

- workspace-shell
- workspace-body
- workspace-detail-panel
- workspace-tabs
- workspace-tab
- workspace-section
- workspace-section-header
- workspace-form-surface
- workspace-popup-layer
- workspace-collection-panel

### Surface-Specific Layers

Teams:
- organization-*

Projects:
- project-*

Tasks:
- task-*

---

## Updated Refactor Roadmap

### Completed

- [x] Phase 1 — Document and freeze shared primitives
- [x] Phase 2 — Add neutral aliases for first shared primitives
- [x] Phase 3 — Migrate Teams top-level workspace primitives
- [x] Phase 4 — Migrate Projects top-level workspace primitives
- [x] Post-migration audit — Identify remaining project-owned shared primitives
- [x] Phase 5 — Add neutral aliases for remaining shared primitives
- [x] Phase 6 — Migrate Teams remaining shared primitivess

### Current

- [ ] Phase 7 — Migrate Projects remaining shared primitives

### Next

- [ ] Phase 8 — Run final workspace coupling audit
- [ ] Phase 9 — Decide whether task surfaces need normalization now or later

## Current Refactor Direction

The current workspace container architecture should remain.

The next goal is not a rewrite. The next goal is to finish removing hidden `project-*` ownership from shared primitives used by Teams and Projects.

The neutral `workspace-*` layer should become the only shared contract.

Project-specific classes should only describe actual Project Workspace content.
Organization-specific classes should only describe actual Teams Workspace content.

---

## High Risk Areas

- Teams tab layout
- Teams scrolling behavior
- Shared popup shell
- project-detail-content
- project-surface-tabs
- workspace frame sizing

---

## Protected Areas

Do not modify without explicit approval:

- Teams Workspace frame
- Dashboard workspace positioning
- Workspace frame sizing
- Workspace top border
- Dashboard lower-center layout

---

## Key Takeaway

The long-term solution is not to remove reuse.

The long-term solution is to make shared workspace primitives explicit and give them clear ownership.
