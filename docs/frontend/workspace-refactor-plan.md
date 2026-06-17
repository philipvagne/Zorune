# Workspace Refactor Plan

## Purpose

This document defines the long-term plan for improving workspace architecture in Zorune.

The goal is to:

- Reduce accidental coupling
- Clarify ownership of shared workspace primitives
- Improve maintainability
- Make future workspace changes safer
- Create a reusable foundation for Teams, Projects, Tasks, Profile, and Settings

This is an architecture planning document.

It does not authorize large rewrites.

All refactoring should happen in small, testable, commit-able phases.

1. Architecture Summary
Workspace Inventory
The workspace frame is rendered through Dashboard -> ContextPanel -> canvasContent, with three current surface modes:
Collection Workspace
Teams: [OrganizationsWorkspace.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/organizations/OrganizationsWorkspace.jsx)
Projects: [ProjectsWorkspace.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/projects/ProjectsWorkspace.jsx)
Notes: [NotesWorkspace.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/notes/NotesWorkspace.jsx)
Archive: [ArchivedTasks.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/archive/ArchivedTasks.jsx)

Form Workspace
Create Task: [CreateTaskPanel.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/tasks/CreateTaskPanel.jsx)

Detail Workspace
Active Task: [TaskModal.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/tasks/TaskModal.jsx)

Account/System Workspace
Profile: currently placeholder content from [Dashboard.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/pages/Dashboard.jsx)
Settings: currently placeholder content from [Dashboard.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/pages/Dashboard.jsx)

Current Structure
The current workspace architecture has two distinct render paths:
Workspace shell path
Used by Teams, Projects, Notes, Archive, Profile, Settings
Built in [Dashboard.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/pages/Dashboard.jsx) with:ContextPanel
workspace-card-shell
workspace-card-header
workspace-card-body


Direct surface path
Used by Active Task and Create Task
These components now self-render their own workspace-card-shell and workspace-card-body
That makes them structurally closer to the frame contract than before, but still on a different composition path from the collection workspaces

Shared Layout Primitives
The real shared primitives today are mostly CSS-based, not component-based:
workspace-card-shell
workspace-card-body
dashboard-workspace-shell
dashboard-context-panel--workspace
popup shell classes under workspace-floating-window*
several project-* classes that are functioning as generic workspace detail primitives
Shared Components
CenterWorkspace is only a thin wrapper and is not a real layout primitive yet: [CenterWorkspace.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/components/dashboard/CenterWorkspace.jsx)
ContextPanel is the actual frame host wrapper
Dashboard owns almost all surface routing and shell decisions
Shared CSS Structures
The most important shared CSS structures are:
frame shell:
dashboard-workspace-shell
workspace-card-shell
workspace-card-body

collection/detail layout:
project-panel
project-detail-content
project-surface-tabs
project-surface-tab
project-surface-section
project-surface-section-header

popup/form layer:
project-form
project-workspace-popup-*
workspace-floating-window*

2. Coupling Analysis
Intentional Reuse
Shared workspace frame shell in [Dashboard.jsx](C:/Users/phili/Desktop/opsflow/opsflow-dashboard/src/pages/Dashboard.jsx)
Shared popup shell behavior between Teams and Projects
Shared collection/detail structure between Teams and Projects
Shared task detail and create-task card styling through workspace-card-shell variants
This reuse is directionally correct. It supports consistency and reduces duplicate CSS.
Accidental Coupling
Teams depends heavily on project-* classes for its right-side detail layout, tabs, sections, avatars, list shells, and forms
Projects is effectively the CSS base provider for both Projects and Teams
TaskModal and CreateTaskPanel use the frame shell classes directly, but outside the same dashboard-level composition used by Teams/Projects
CenterWorkspace is not actually a meaningful primitive yet; Dashboard still owns all structural behavior
Dashboard passes className into CenterWorkspace, but CenterWorkspace does not accept or apply it. That is a structural smell and shows the layout API is not stable
Risky Shared Dependencies
High-risk shared dependencies are:
project-detail-content
project-surface-tabs
project-surface-tab
project-surface-section
project-surface-section-header
project-overview-surface
project-form
project-workspace-popup-*
If one of these changes, Teams can regress even when only Projects seems to be touched.
Areas Where One Workspace Can Affect Another
Teams right-side detail area can be broken by Project CSS edits
Project popup/form edits can break Team create/edit/remove flows
Shared frame height/max-height rules can affect all workspace-hosted surfaces
Task surfaces are safer now than before, but still rely on the same workspace-card-shell behavior and can be affected by frame shell CSS changes

3. Naming Analysis
Misleading Class Names
The biggest naming problem is that many project-* classes are no longer project-only. They now behave like generic workspace-detail primitives.
Examples:
project-detail-content
project-surface-tabs
project-surface-tab
project-surface-section
project-surface-section-header
project-overview-surface
project-overview-actions
project-form
project-workspace-popup-layer
project-workspace-popup-backdrop
project-workspace-popup-shell
project-* Classes Acting As Generic Workspace Primitives
These are effectively reusable workspace classes already:
project-panel
project-list-panel
project-detail-content
project-surface-tabs
project-surface-tab
project-surface-section
project-surface-section-header
project-form
project-workspace-popup-*
organization-* Classes That Are Actually Teams-Specific
These are correctly Teams-owned in practice:
organizations-workspace
organization-detail-content
organization-overview-*
organization-members-*
organization-projects-*
organization-settings-*
These are not generic organization primitives. They are specifically the Teams workspace implementation.
Opportunities For Clearer Structure
The codebase wants three naming layers:
workspace-* for generic frame/detail primitives
teams-* or organization-* for Teams-only surface implementation
projects-* for Project-only behavior
Right now project-* is doing double duty as both shared and project-specific.

4. Primitive Candidates
These are the strongest candidates to become explicit reusable workspace primitives:
workspace-shell
outer frame shell
currently approximated by workspace-card-shell

workspace-body
inner bounded content region
currently workspace-card-body

workspace-detail-panel
right-side detail column/container
currently split across project-detail-content, organization-detail-content, task/create task bodies

workspace-tabs
currently project-surface-tabs

workspace-tab
currently project-surface-tab

workspace-section
currently project-surface-section

workspace-section-header
currently project-surface-section-header

workspace-form-surface
currently spread across project-form, task form sections, popup content

workspace-popup-layer
currently project-workspace-popup-* plus workspace-floating-window*

workspace-collection-panel
currently project-panel plus list-panel variants

These are candidates only. They should be extracted gradually, not renamed wholesale.

5. Recommended Target Structure
A safer target structure would be:
Dashboard
owns routing only
chooses which workspace surface to render

ContextPanel
owns stable frame placement only

WorkspaceShell
owns frame shell, header slot, body slot, sizing contract

Workspace surface components
Teams
Projects
Notes
Archive
Task Detail
Create Task
Profile
Settings

Each surface should then compose from shared primitives like:
workspace-detail-panel
workspace-tabs
workspace-section
workspace-popup-layer
And keep its own domain-specific classes for the actual content inside those primitives.
That keeps the frame stable and makes domain surfaces easier to reason about.

6. Phased Refactor Roadmap
Phase 1: Document and freeze shared primitives
Identify current shared CSS selectors that already behave like workspace primitives
Do not rename anything yet
Test: Teams, Projects, Active Task, Create Task all still render identically
Phase 2: Extract neutral aliases
Introduce neutral workspace-* aliases for the most reused project-* layout classes
Keep old classes mapped in parallel
Test: Teams and Projects tabs, detail areas, and popups remain unchanged
Phase 3: Migrate Teams to neutral primitives
Move Teams from project-* structural dependencies to workspace-*
Leave Teams-specific content classes alone
Test: all Teams tabs, all Team popup flows, internal scrolling
Phase 4: Migrate Projects to neutral primitives
Move Projects to the same shared workspace primitives
Leave project-specific content classes as project-*
Test: project overview, tasks, notes, members, all project popups
Phase 5: Normalize task surfaces
Align TaskModal and CreateTaskPanel with the same shell/detail primitives used by collection workspaces
Test: task detail scroll, create-task scroll, frame height consistency
Phase 6: Clean up placeholders and account/system surfaces
Apply same primitives to Profile and Settings once those are real surfaces
Test: shell stability and internal scrolling only
Each phase is independently testable and commit-able.

7. Risk Assessment
High-Risk Areas
Teams right-side detail layout
Teams tab row and tab body scroll behavior
shared popup/form shell between Teams and Projects
any change to project-detail-content, project-surface-tabs, project-surface-section
workspace frame sizing rules in App.css
Low-Risk Areas
domain-specific Teams content classes under organization-overview-*, organization-members-*, organization-projects-*, organization-settings-*
domain-specific Project content classes for cards, notes, and member rows
local copy/layout helpers inside task detail sections
Areas That Should Not Be Touched Yet
Teams outer frame contract
dashboard-level frame geometry
workspace-card-shell height/max-height rules unless absolutely necessary
mobile/global workspace layout rules until desktop primitive separation is stable
Most Important Current Conclusion
The architecture is not mainly suffering from too much reuse. It is suffering from unclear ownership of reuse.
The biggest structural problem is:
project-* classes are acting as hidden generic workspace primitives
Dashboard still owns too much shell composition logic
CenterWorkspace is too thin to be a real workspace abstraction
That is why small changes are expensive and regressions feel unrelated to the file being edite