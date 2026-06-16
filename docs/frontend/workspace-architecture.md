# Workspace Architecture

## Purpose

The workspace frame is the main lower-center product surface in Zorune.

It is the fixed visual and structural container where the user works with teams, projects, tasks, profile, settings, and task creation.

The current Teams Workspace implementation is the visual reference for this frame.

## Workspace Frame Contract

All active workspace surfaces must render inside the same workspace frame.

This includes:

- Teams
- Projects
- Profile
- Settings
- Active task detail
- Create new task
- Project notes and task notes/comments when shown inside project or task context

The workspace frame must keep the same:

- position
- width
- height
- outer border radius
- top purple border
- background integration
- relationship to the dashboard background
- relationship to the left rail, kanban area, and right-side panels

The internal content may change per workspace, but the outer frame must remain consistent.

## Source of Truth

The existing Teams Workspace frame is the current source of truth.

Do not modify the Teams Workspace frame, sizing, position, border, or shell behavior unless explicitly approved.

If another workspace does not fit correctly, fix that workspace so it conforms to the frame.

Do not change the frame to fit the workspace.

## Protected Areas

Codex and other agents must not modify these unless explicitly approved:

- Teams Workspace outer frame
- dashboard workspace positioning
- main workspace shell sizing
- workspace top border behavior
- dashboard lower-center layout
- global workspace container rules

## Implementation Rule

When fixing Projects, Profile, Settings, active task detail, or create task:

- Do not resize the workspace frame
- Do not move the workspace frame
- Do not change the Teams Workspace layout
- Do not change dashboard-level layout rules
- Keep changes scoped to the target workspace surface
- Add internal scrolling inside the target surface when needed
- Keep important controls reachable inside the frame

## Scroll Rule

If a workspace surface has content taller than the available frame:

- the workspace frame must not grow
- the page must not grow
- the target workspace content must scroll internally
- action buttons must remain reachable

## Design Principle

The workspace frame should feel stable.

Changing workspace tabs or opening task/detail/create surfaces should feel like changing the content inside the same workspace, not opening a new page or resizing the app.

## Current Priority

The current priority is to make these surfaces conform to the workspace frame:

1. Active task detail
2. Create new task
3. Projects
4. Profile
5. Settings

Teams is already the reference and should be protected.