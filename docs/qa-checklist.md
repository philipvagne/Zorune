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

- [X] Valid login succeeds and lands in the main workspace.
- [X] Invalid password shows a clear error and does not partially log in.
- [X] Unknown email shows a clear error and does not partially log in.
- [X] Refresh after login keeps the user signed in.
- [X] Logout removes access to authenticated views immediately.
    - I mean i think so, it takes be straight to the login "start page" in the browser
- [X] After logout, browser back navigation does not reopen protected content in a usable state.

### Registration

- [X] Registration succeeds with valid data.
    - Right now i can just use any email i want to register, Its really good when testing. Needs to be redone later with valid email and maybe verification / google sign up might get added or similar aswell?
- [X] Duplicate email is rejected clearly.
- [-] Duplicate username, if supplied, is rejected clearly.
    - Not testing, I think that Email and Full Name will be the standard and il skip having usernames.
- [X] Missing required fields are blocked with understandable feedback.

### Session State

- [-] Expired or invalid token returns the user to a safe logged-out state.
    - Dont know how to test this
- [-] Opening the app with a stale token does not leave the UI stuck between logged-in and logged-out states.
    - Dont know how to test this
- [X] Signed-in state is consistent across refreshes.

---

## Organizations

### Team Listing And Selection

- [X] User sees only teams they belong to.
    - But gets an "error" message in the top left in the workspace when not in a team at all that says "Not allowed in this organization", Remove it,
- [X] Team list loads without empty, duplicated, or broken entries.
  - Dosnt update until refresh.
- [X] Selected team persists after refresh.
- [X] If the remembered team no longer exists or access is removed, the workspace falls back cleanly.
    - Dosnt update until refresh.

### Create And Edit Team

- [X] Creating a team succeeds with valid name.
    - Creating the first team as a new user looks wrong. The workspace is cropped and super small, Should as a default be just as the normal teams workspace even if the user dont have a team yet.
    - Creating a team should not open up as a "popup" but instead open as a "tab" in the right side of the workspace.
- [X] Empty team name is blocked.
    - Says "Team name is required." in red so the error is correct but kinda of, It shows up subtle in the left top corner
      off the workspace and not within the "Create Team Window" and that can make it hard for users to understand whats wrong.
- [X] Duplicate or invalid slug is handled clearly.
    - Do i really need slugs? I think that team name is enough.
- [X] Team edits update visible name and slug consistently across the workspace.
- [X] Canceling create or edit closes the popup without partial state leaks.

### Members And Roles

- [X] Team members load correctly for the selected team.
    - Team member count in the left workspace team card didnt seem to update until browser refresh
- [X] Adding a valid existing user succeeds.
    - Currently accepts Email and Username. Is both needed?
    - Seems to be upper/lower case sensetive. probably not a good thing for user experience
- [X] Adding a missing user fails clearly.
    - Says "User not found" in red so the error is correct but kinda of, It shows up subtle in the left top corner
      off the workspace and not within the "Add member to team window" and that can make it hard for users to understand whats wrong. 
- [X] Adding the same user twice is prevented cleanly.
    - Says "User already belongs to this organization" in red so the error is correct but kinda of, It shows up subtle in the left top    corner off the workspace and not within the "Add member to team window" and that can make it hard for users to understand whats wrong. Should also say "team" and not "organization"
- [X] Role selection is saved correctly.
- [X] Member counts update after add or remove.
    - Only seem to update after browser refresh
- [X] Removing a member removes access on refresh and on the next protected request.

### Permissions

- [-] Viewer cannot see management actions that should be restricted.
    - Currently not really using "viewer". Should only exist for maybe projects/tasks as more of a "manager" overview thing
- [-] Viewer cannot perform restricted actions through direct URL or stale UI state.
    - Currently not really using "viewer". Should only exist for maybe projects/tasks as more of a "manager" overview thing
- [X] Member/Admin/Owner behavior matches expected management rights.
    - Looks like a member in a team can access every project in the team without being in that project and create tasks/notes etc. Should not have access to projects that they are not apart off even if the project exists in the team. 
- [X] User removed from a team cannot continue browsing its projects, notes, or members after refresh.
    - Can browse trough tabs when removed, but as soon as the removed user interacts with anything it gets "kicked" out. Should probably be instantly removed without the need of a "refresh"

### Delete Team

- [X] Team deletion requires explicit confirmation flow.
- [X] Deleting a team removes it from lists and resets selected team state safely.
- [X] Deleting one team does not break navigation to remaining teams.

---

## Projects

[-] Project workspace conforms to Workspace Architecture.

    - Workspace does not fit inside the approved workspace frame.
    - Lower content becomes inaccessible.
    - Cannot complete full QA pass on Projects until workspace containment is fixed.

### Project Listing And Selection

- [ ] Projects shown belong to the selected team only.
- [ ] Selected project persists after refresh.
- [ ] If remembered project is deleted or access is removed, the workspace clears or falls back cleanly.
- [ ] Empty project states are calm and understandable.

### Create And Edit Project

- [X] Creating a project succeeds with valid data.
    - Creating a new project did put me straight in the project notes tab in the workspace, should be the overview tab by default.
    - Creating a project should not open up as a "popup" but instead open as a "tab" in the right side of the workspace.
- [X] Empty project name is blocked.
    - Says "Project name is required." in red so the error is correct but kinda of, It shows up subtle in the left top corner
      off the workspace and not within the "Create Project Window" and that can make it hard for users to understand whats wrong.
- [ ] Editing project name or description updates all visible project surfaces consistently.
- [-] Canceling create or edit does not leave stale form state behind when reopened.
    - If i open the "Create project" and write a name and description and then press cancel. The name/description that i wrote is there the next time i open the "create project"

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

- [X] My Tasks loads only tasks relevant to the signed-in user.
- [X] Kanban, table, and calendar views show the same underlying tasks.
- [X] Archived tasks are excluded from active task views.
    - I have taken away the "Archived task" view so i cant see it. But if i Archive a task that is done it dissapears from the active task view.
- [X] Switching task layouts does not lose current task data or produce duplicate entries.

### Create Task

- [X] Task creation requires selecting a team and project.
    - There is no option to try to create a task without a selected team or project.
- [X] Empty title is blocked.
- [X] New task appears in the correct project and correct status column.
- [X] Creator auto-assignment, if intended, is visible and consistent after refresh.
    - Yes the creator of the task gets assigned automaticly to the task, thats intended.

### Edit Task

- [X] Status changes persist after refresh.
- [X] Due date save persists after refresh.
    - Dont like how it looks on the kanban card
- [X] Due date clear persists after refresh.
- [X] Description and title remain consistent across task modal, project view, and task list.
    - Description should only show up in the task in the workspace never on the "cards" in the different views.
    - Cant seem to edit description after the task has been made.
- [X] Invalid or partial task updates do not leave the UI in a misleading optimistic state.

### Assignment

- [X] Searching for assignable users works with name, username, and email when available.
- [X] Assigning a user updates assignee chips correctly.
- [X] Removing an assignee updates the task correctly.
- [X] Duplicate assignees are not created.
- [X] Assigning or removing assignees updates visibility for affected users after refresh and in realtime where supported.
    - Seems to work as a realtime update from what i see. (good)

### Archive And Restore

- [X] Only completed tasks can be archived if that is the intended rule.
- [X] Archived tasks disappear from active views.
- [-] Archived tasks appear in archive view.
    - I have taken away the "Archived task" view so i cant see it. But if i Archive a task that is done it dissapears from the active task view. So i cant test this
- [-] Restored tasks return to active views with correct status and metadata.
    - I have taken away the "Archived task" view so i cant see it. But if i Archive a task that is done it dissapears from the active task view. So i cant test this

### Task Updates

- [X] Posting a progress update succeeds and appears once.
    - This function will be removed. Status updates and notes are enough for tasks.
- [X] Empty update submission is blocked.
- [X] Task updates persist after refresh.
- [X] Updates posted by another user appear in realtime without duplicates.

### Task Permissions

- [X] User without task visibility cannot open task details through stale selection state.
    - I think so, if the user isnt assigned to the task it cant see it in the "UI"
- [X] Removed assignee behavior is correct if task visibility depends on assignment.
    - Does seem that anyone in the task can add/remove users in the task. I could remove the creater of the task from another user. 
    Should not work like that. 
- [-] Team removal or project removal cuts off task access cleanly.
    - Cant test this because i cant delete the project within its current UI

### Task UX Consistency

- [X] The selected task closes cleanly when the task disappears from available data.
- [X] Overdue state is visually consistent across task surfaces.
- [-] No task action leaves the modal open on a deleted or inaccessible task in a broken state.
    - Dont really understand what this means.

---

## Notes
[-] Notes inside projects workspace conforms to Workspace Architecture.
    - Workspace does not fit inside the approved workspace frame.
    - Lower content becomes inaccessible.
    - Cannot complete full QA pass on nots until workspace containment is fixed

    - This system and how it would work and were needs to be redesign/re thought out before testing. 

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

- [X] Notifications load in newest-first order.
- [X] Unread count matches visible unread items.
    - The tasks in the list dosnt show if they are unread or not. They look the same all the time.
- [X] Empty state is calm and accurate.
- [X] Notification copy is understandable and not obviously duplicated.

### Read State

- [X] Opening or clicking an unread notification marks it as read once.
- [X] Mark all read updates the entire list and unread count.
- [X] Read state persists after refresh.
- [-] Deleting a notification removes it from the list immediately and after refresh.
    - The delete option is no longer in use.

### Relevance And Consistency

- [X] Only attention-worthy events appear here, not general activity noise.
    - From what i can see right now it looks okay. Needs further testing.
- [X] Notification type labels match the actual underlying event.
    - Yes. But they need to be redone, looks like a computer message now and not "human user friendly"
- [X] Notification timestamps feel accurate and consistent with other surfaces.
    - Before the timestamp is says "status" all the time. Dont really now what that is.
- [X] The same event is not inserted multiple times from fetch plus socket delivery.
    - I noticed that when i "spammed" the add member as a test in a task i got like 5 of the same notifications. But other then that and things being used normal. There dosnt seem to be any duplicates

- Extra: Notification window closes when i click on something outside of it. It should only open and close when i press the notification bell in the top right corner of the app

### Permissions

- [X] User never sees another user’s notifications.
    - From what i can see during limited testing this is true.
- [X] Deleted or inaccessible source work does not leave broken notification behavior.

---

## Recent Work

### Recency Memory

- [X] Opening tasks adds them to Recent Work once, without duplication.
- [X] Opening projects adds them to Recent Work once, without duplication.
- [-] Opening notes adds them to Recent Work once, without duplication.
    - Dont use it right now so not tested.
- [X] Opening teams adds them to Recent Work once, without duplication.
- [X] Most recent items rise to the top.

### Boundaries

- [X] Background changes from another user do not create Recent Work entries.
- [X] Notification events do not create Recent Work entries unless the item is actually opened.
- [X] Deleted or inaccessible items do not remain as broken recent entries after refresh or next access.

### UX

- [X] Selecting a recent item opens the correct destination.
- [X] Opening Recent Work and selecting an item closes the panel cleanly.
- [X] Empty state is accurate for a fresh user.

- Extra: Recent work window closes (only sometimes?) when i click on something outside of it. It should only open and close when i press the recent work icon in the top right corner of the app

---

## Workspace UX

### Navigation And Context

- [X] Left-rail navigation always opens the expected workspace.
- [X] Switching between Tasks, Teams, Projects, Notes, and Archive does not leave overlapping panels behind.
- [X] Closing a task or workspace panel returns the user to a sensible state.
    - When i updated the "Teams" Workspace the option of closing it dissapeared, needs to get re implemented.
- [X] Command palette opens and closes reliably with keyboard shortcut and Escape.
- [X] Command palette results open the intended task or workspace.
    - From here i can actually acess "Notes" and "Archived Tasks" Workspace still. 

### Visual And Interaction Consistency

- ***The UI is not up to date to test this yet.***

- [ ] Empty states are consistent in tone and spacing.
- [ ] Popup dialogs close on intended actions and do not close unexpectedly.
- [ ] Buttons, labels, and terminology are consistent between `Team` and `Organization` surfaces from the user’s perspective.
- [ ] There are no obvious broken characters, placeholder text, or malformed separators in UI copy.
- [ ] Long names, long note titles, and long task titles do not break layout badly.

### Error Handling

- [X] Failed requests show useful feedback instead of silent failure.
    - Most failed requests are subtle and out of the "area" as described earlier.
- [X] Errors clear when the user retries successfully.
- [X] Partial loading states do not strand the page in a blank or mixed state.

---

## State Persistence

### Refresh Persistence

- [X] Active top-level workspace persists after refresh.
- [X] Selected task persists after refresh when still available.
- [X] Task filters persist after refresh.
- [X] Selected team in Teams workspace persists after refresh.
- [X] Selected team and selected project in Projects workspace persist after refresh.
- [-] Selected team, note, search text, project filter, and task filter in Notes workspace persist after refresh.
    - Not tested, Wont have a workspace for notes most likely.
- [X] Recent Work state persists appropriately.

### Invalid Persisted State

- [X] Deleted selected task is cleared safely on reload.
    - Tasks cant get deleted but the are cleared when being archived.
- [X] Deleted selected project is cleared safely on reload.
- [X] Deleted selected note is cleared safely on reload.
    - Could only test this within a Task
- [X] Removed team membership clears stale remembered selections safely.
- [X] Reset workspace action clears remembered local workspace state without leaving mixed UI.

### Cross-Surface Consistency

- [X] Updating an item in one surface does not leave another surface showing stale saved state after refresh.
- [X] Persisted filters do not hide all data in a confusing way after team or project changes.

---

## Realtime Behavior

### Task Realtime

- [X] Status changes made in `Session A` appear in `Session B` without refresh.
- [X] Due date changes made in one session appear in the other without duplicates.
- [X] Assignment changes update visible task membership in both sessions where supported.
- [X] Archived tasks disappear from active views in other sessions.
- [X] Newly assigned tasks appear for the assignee without requiring a full reload if supported.

### Task Update Realtime

- [-] Progress updates posted in one session appear in the other once.
    - Not tested. Function will be removed.
- [X] Refresh after realtime delivery does not duplicate updates.

### Notes Realtime Or In-Session Sync

[-] Notes inside projects workspace conforms to Workspace Architecture.
    - Workspace does not fit inside the approved workspace frame.
    - Lower content becomes inaccessible.
    - Cannot complete full QA pass on nots until workspace containment is fixed

    - This system and how it would work and were needs to be redesign/re thought out before testing. 

- [ ] New task-linked or project-linked notes appear where current event wiring is expected to surface them.
- [ ] New notes do not appear in unrelated teams or projects.
- [ ] Note creation does not create duplicate entries when combined with fetch refreshes.

### Notifications Realtime

- [X] New notifications arrive live for the target user only.
- [X] The same notification is not duplicated by initial fetch and socket event.
- [X] Unread count updates when live notifications arrive.

### Presence And Viewers

- [X] Online presence shows only relevant users, not all users globally.
    - From what i can see.
- [X] Opening a task in two sessions updates the task viewer list correctly.
    - Not sure that ill keep this function.
- [X] Closing the task removes the viewer presence correctly.
- [-] Closing the browser tab or disconnecting a session clears stale viewer presence.
    - Did not logout and just closed the browser tab and the user still appears as a viewer in a task.
- [X] A user with multiple tabs does not appear duplicated incorrectly in viewers.

### Realtime Permission Boundaries

- [X] Users do not receive task updates for work they should no longer access.
- [X] Users removed from a team or project stop receiving relevant realtime events after reconnect or refresh.
- [-] Presence and viewer events do not reveal inaccessible users or tasks.
    - Not tested

---

## Regression Pass

- **NOT TESTED, No substantial change since last tested**

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
