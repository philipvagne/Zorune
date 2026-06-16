# Zorune Version 1 Manual QA Checklist

## Purpose

This checklist is for manual Version 1 testing by a solo developer.

It is designed to catch:

- functional bugs
- UX inconsistencies
- state persistence issues
- realtime synchronization issues
- permission and visibility issues

It does not evaluate roadmap ideas or suggest new features.

## Testing Approach

Use two browser sessions when possible:

- `Session A`: primary signed-in user
- `Session B`: secondary signed-in user in a different browser or private window

Suggested baseline accounts:

- `Owner/Admin user`
- `Member user`
- `Viewer user`
- one user not added to the target team or project

Test each section for:

- happy path
- invalid input
- permission boundaries
- refresh behavior
- cross-surface consistency

## Test Data Setup

Before starting, prepare:

- at least 2 teams
- at least 2 projects in one team
- at least 3 tasks with mixed statuses
- at least 1 archived task
- at least 3 notes:
  - one general team note
  - one project-linked note
  - one task-linked note
- at least 2 users in the same team
- at least 1 user removed from a project but still in the team

---

## Authentication

### Login

- [ ] Valid login succeeds and lands in the main workspace.
- [ ] Invalid password shows a clear error and does not partially log in.
- [ ] Unknown email shows a clear error and does not partially log in.
- [ ] Refresh after login keeps the user signed in.
- [ ] Logout removes access to authenticated views immediately.
- [ ] After logout, browser back navigation does not reopen protected content in a usable state.

### Registration

- [ ] Registration succeeds with valid data.
- [ ] Duplicate email is rejected clearly.
- [ ] Duplicate username, if supplied, is rejected clearly.
- [ ] Missing required fields are blocked with understandable feedback.

### Session State

- [ ] Expired or invalid token returns the user to a safe logged-out state.
- [ ] Opening the app with a stale token does not leave the UI stuck between logged-in and logged-out states.
- [ ] Signed-in state is consistent across refreshes.

---

## Organizations

### Team Listing And Selection

- [ ] User sees only teams they belong to.
- [ ] Team list loads without empty, duplicated, or broken entries.
- [ ] Selected team persists after refresh.
- [ ] If the remembered team no longer exists or access is removed, the workspace falls back cleanly.

### Create And Edit Team

- [ ] Creating a team succeeds with valid name.
- [ ] Empty team name is blocked.
- [ ] Duplicate or invalid slug is handled clearly.
- [ ] Team edits update visible name and slug consistently across the workspace.
- [ ] Canceling create or edit closes the popup without partial state leaks.

### Members And Roles

- [ ] Team members load correctly for the selected team.
- [ ] Adding a valid existing user succeeds.
- [ ] Adding a missing user fails clearly.
- [ ] Adding the same user twice is prevented cleanly.
- [ ] Role selection is saved correctly.
- [ ] Member counts update after add or remove.
- [ ] Removing a member removes access on refresh and on the next protected request.

### Permissions

- [ ] Viewer cannot see management actions that should be restricted.
- [ ] Viewer cannot perform restricted actions through direct URL or stale UI state.
- [ ] Member/Admin/Owner behavior matches expected management rights.
- [ ] User removed from a team cannot continue browsing its projects, notes, or members after refresh.

### Delete Team

- [ ] Team deletion requires explicit confirmation flow.
- [ ] Deleting a team removes it from lists and resets selected team state safely.
- [ ] Deleting one team does not break navigation to remaining teams.

---

## Projects

### Project Listing And Selection

- [ ] Projects shown belong to the selected team only.
- [ ] Selected project persists after refresh.
- [ ] If remembered project is deleted or access is removed, the workspace clears or falls back cleanly.
- [ ] Empty project states are calm and understandable.

### Create And Edit Project

- [ ] Creating a project succeeds with valid data.
- [ ] Empty project name is blocked.
- [ ] Editing project name or description updates all visible project surfaces consistently.
- [ ] Canceling create or edit does not leave stale form state behind when reopened.

### Project Membership

- [ ] Only eligible team members can be added to a project.
- [ ] Existing project members are not offered again as add options.
- [ ] Removing a project member updates the project member list immediately or after refresh.
- [ ] Removed project members lose access to project detail, project tasks, and project notes.

### Project Surface Consistency

- [ ] Project task count and member count feel consistent with visible data.
- [ ] Project notes shown belong to the selected project only.
- [ ] Opening a task from project view opens the correct task.
- [ ] Creating a task from project view attaches it to the correct team and project.

### Permissions

- [ ] Viewer or non-manager cannot see restricted project management controls.
- [ ] A user in the team but not in the project cannot access project detail if project membership is intended to restrict access.
- [ ] Direct API-driven transitions do not leave unauthorized project data visible in stale UI panels.

### Delete Project

- [ ] Project deletion removes it from the current team list.
- [ ] If the deleted project was selected, selection resets safely.
- [ ] Deleting one project does not corrupt other project workspace state.

---

## Tasks

### Task Loading And Core Views

- [ ] My Tasks loads only tasks relevant to the signed-in user.
- [ ] Kanban, table, and calendar views show the same underlying tasks.
- [ ] Archived tasks are excluded from active task views.
- [ ] Switching task layouts does not lose current task data or produce duplicate entries.

### Create Task

- [ ] Task creation requires selecting a team and project.
- [ ] Empty title is blocked.
- [ ] New task appears in the correct project and correct status column.
- [ ] Creator auto-assignment, if intended, is visible and consistent after refresh.

### Edit Task

- [ ] Status changes persist after refresh.
- [ ] Due date save persists after refresh.
- [ ] Due date clear persists after refresh.
- [ ] Description and title remain consistent across task modal, project view, and task list.
- [ ] Invalid or partial task updates do not leave the UI in a misleading optimistic state.

### Assignment

- [ ] Searching for assignable users works with name, username, and email when available.
- [ ] Assigning a user updates assignee chips correctly.
- [ ] Removing an assignee updates the task correctly.
- [ ] Duplicate assignees are not created.
- [ ] Assigning or removing assignees updates visibility for affected users after refresh and in realtime where supported.

### Archive And Restore

- [ ] Only completed tasks can be archived if that is the intended rule.
- [ ] Archived tasks disappear from active views.
- [ ] Archived tasks appear in archive view.
- [ ] Restored tasks return to active views with correct status and metadata.

### Task Updates

- [ ] Posting a progress update succeeds and appears once.
- [ ] Empty update submission is blocked.
- [ ] Task updates persist after refresh.
- [ ] Updates posted by another user appear in realtime without duplicates.

### Task Permissions

- [ ] User without task visibility cannot open task details through stale selection state.
- [ ] Removed assignee behavior is correct if task visibility depends on assignment.
- [ ] Team removal or project removal cuts off task access cleanly.

### Task UX Consistency

- [ ] The selected task closes cleanly when the task disappears from available data.
- [ ] Overdue state is visually consistent across task surfaces.
- [ ] No task action leaves the modal open on a deleted or inaccessible task in a broken state.

---

## Notes

### Notes Listing And Selection

- [ ] Notes load for the selected team only.
- [ ] Project and task filters narrow results correctly.
- [ ] Search matches title, content, and linked context as expected.
- [ ] Selected note persists after refresh.
- [ ] If the remembered note is deleted or filtered out, selection resets safely.

### Edit And Delete Note

- [ ] Editing title, content, kind, and project link persists after refresh.
- [ ] Empty note title is blocked.
- [ ] Delete removes the note from list and detail surfaces consistently.
- [ ] Canceling note edit restores current saved values.

### Pinning

- [ ] Pin moves the note into the pinned section.
- [ ] Unpin returns the note to recency ordering.
- [ ] Pin state persists after refresh.
- [ ] Failed pin actions roll back visual state correctly.

### Linked Notes

- [ ] Linked notes load for the selected note.
- [ ] Linking a note creates one visible relationship without duplicates.
- [ ] Unlink removes the relationship cleanly.
- [ ] A note cannot be linked to itself.
- [ ] Cross-team notes are not linkable if visibility should be restricted.

### Task-Linked Notes

- [ ] Creating a linked note from a task attaches it to the correct task and project.
- [ ] Task-linked notes appear in the task detail panel and notes workspace consistently.
- [ ] Editing a task-linked note from one surface is reflected in the other after refresh and where supported in-session.
- [ ] Deleting a task-linked note removes unread awareness appropriately.

### Notes Permissions

- [ ] User cannot load notes from a team they do not belong to.
- [ ] User cannot keep reading a note after losing access through team or project removal.
- [ ] Note links do not expose inaccessible note titles or metadata.

---

## Notifications

### Notification List

- [ ] Notifications load in newest-first order.
- [ ] Unread count matches visible unread items.
- [ ] Empty state is calm and accurate.
- [ ] Notification copy is understandable and not obviously duplicated.

### Read State

- [ ] Opening or clicking an unread notification marks it as read once.
- [ ] Mark all read updates the entire list and unread count.
- [ ] Read state persists after refresh.
- [ ] Deleting a notification removes it from the list immediately and after refresh.

### Relevance And Consistency

- [ ] Only attention-worthy events appear here, not general activity noise.
- [ ] Notification type labels match the actual underlying event.
- [ ] Notification timestamps feel accurate and consistent with other surfaces.
- [ ] The same event is not inserted multiple times from fetch plus socket delivery.

### Permissions

- [ ] User never sees another user’s notifications.
- [ ] Deleted or inaccessible source work does not leave broken notification behavior.

---

## Recent Work

### Recency Memory

- [ ] Opening tasks adds them to Recent Work once, without duplication.
- [ ] Opening projects adds them to Recent Work once, without duplication.
- [ ] Opening notes adds them to Recent Work once, without duplication.
- [ ] Opening teams adds them to Recent Work once, without duplication.
- [ ] Most recent items rise to the top.

### Boundaries

- [ ] Background changes from another user do not create Recent Work entries.
- [ ] Notification events do not create Recent Work entries unless the item is actually opened.
- [ ] Deleted or inaccessible items do not remain as broken recent entries after refresh or next access.

### UX

- [ ] Selecting a recent item opens the correct destination.
- [ ] Opening Recent Work and selecting an item closes the panel cleanly.
- [ ] Empty state is accurate for a fresh user.

---

## Workspace UX

### Navigation And Context

- [ ] Left-rail navigation always opens the expected workspace.
- [ ] Switching between Tasks, Teams, Projects, Notes, and Archive does not leave overlapping panels behind.
- [ ] Closing a task or workspace panel returns the user to a sensible state.
- [ ] Command palette opens and closes reliably with keyboard shortcut and Escape.
- [ ] Command palette results open the intended task or workspace.

### Visual And Interaction Consistency

- [ ] Empty states are consistent in tone and spacing.
- [ ] Popup dialogs close on intended actions and do not close unexpectedly.
- [ ] Buttons, labels, and terminology are consistent between `Team` and `Organization` surfaces from the user’s perspective.
- [ ] There are no obvious broken characters, placeholder text, or malformed separators in UI copy.
- [ ] Long names, long note titles, and long task titles do not break layout badly.

### Error Handling

- [ ] Failed requests show useful feedback instead of silent failure.
- [ ] Errors clear when the user retries successfully.
- [ ] Partial loading states do not strand the page in a blank or mixed state.

---

## State Persistence

### Refresh Persistence

- [ ] Active top-level workspace persists after refresh.
- [ ] Selected task persists after refresh when still available.
- [ ] Task filters persist after refresh.
- [ ] Selected team in Teams workspace persists after refresh.
- [ ] Selected team and selected project in Projects workspace persist after refresh.
- [ ] Selected team, note, search text, project filter, and task filter in Notes workspace persist after refresh.
- [ ] Recent Work state persists appropriately.

### Invalid Persisted State

- [ ] Deleted selected task is cleared safely on reload.
- [ ] Deleted selected project is cleared safely on reload.
- [ ] Deleted selected note is cleared safely on reload.
- [ ] Removed team membership clears stale remembered selections safely.
- [ ] Reset workspace action clears remembered local workspace state without leaving mixed UI.

### Cross-Surface Consistency

- [ ] Updating an item in one surface does not leave another surface showing stale saved state after refresh.
- [ ] Persisted filters do not hide all data in a confusing way after team or project changes.

---

## Realtime Behavior

### Task Realtime

- [ ] Status changes made in `Session A` appear in `Session B` without refresh.
- [ ] Due date changes made in one session appear in the other without duplicates.
- [ ] Assignment changes update visible task membership in both sessions where supported.
- [ ] Archived tasks disappear from active views in other sessions.
- [ ] Newly assigned tasks appear for the assignee without requiring a full reload if supported.

### Task Update Realtime

- [ ] Progress updates posted in one session appear in the other once.
- [ ] Refresh after realtime delivery does not duplicate updates.

### Notes Realtime Or In-Session Sync

- [ ] New task-linked or project-linked notes appear where current event wiring is expected to surface them.
- [ ] New notes do not appear in unrelated teams or projects.
- [ ] Note creation does not create duplicate entries when combined with fetch refreshes.

### Notifications Realtime

- [ ] New notifications arrive live for the target user only.
- [ ] The same notification is not duplicated by initial fetch and socket event.
- [ ] Unread count updates when live notifications arrive.

### Presence And Viewers

- [ ] Online presence shows only relevant users, not all users globally.
- [ ] Opening a task in two sessions updates the task viewer list correctly.
- [ ] Closing the task removes the viewer presence correctly.
- [ ] Closing the browser tab or disconnecting a session clears stale viewer presence.
- [ ] A user with multiple tabs does not appear duplicated incorrectly in viewers.

### Realtime Permission Boundaries

- [ ] Users do not receive task updates for work they should no longer access.
- [ ] Users removed from a team or project stop receiving relevant realtime events after reconnect or refresh.
- [ ] Presence and viewer events do not reveal inaccessible users or tasks.

---

## Regression Pass

Run this short pass after any substantial change:

- [ ] Login, refresh, logout
- [ ] Open a team, project, task, and note
- [ ] Create and edit one task
- [ ] Create and edit one note
- [ ] Assign and unassign one user on a task
- [ ] Archive and restore one task
- [ ] Mark one notification read
- [ ] Confirm Recent Work order updates correctly
- [ ] Refresh and verify remembered workspace state
- [ ] Verify one realtime task change across two sessions

## Defect Logging Format

For each issue found, capture:

- area
- exact action taken
- expected result
- actual result
- whether it reproduces after refresh
- whether it reproduces in a second session
- role used
- team or project context
