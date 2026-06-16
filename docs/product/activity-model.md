# Activity Model

## Purpose

Zorune needs a clear activity model so users do not have to guess where information belongs or what deserves their attention.

This model defines the distinction between:

- `Recent Work`: a navigation system
- `Notifications`: an attention system
- `Recent Activity`: an informational activity system

The goal is to reduce chaos faster than complexity is added.

This model is designed to support:

- calm daily workflows
- clarity over feature count
- maintainability in product and implementation
- simple, durable rules that still make sense as Zorune grows

---

## Core Principle

These three systems must not compete with each other.

Each one should answer a different user need:

- `Recent Work` helps users return to what they were doing.
- `Notifications` helps users see what needs attention.
- `Recent Activity` helps users understand what has changed.

If the same event appears everywhere without a clear reason, the model has failed.

Overlap is acceptable only when the reason for inclusion is different in each system.

---

## 1. Recent Work

### Purpose

`Recent Work` is a quiet navigation shortcut. It helps users quickly resume work they have already touched.

### User Question Answered

"What was I working on recently?"

### Inclusion Rules

- Include items the user has recently opened or actively interacted with.
- Include projects, tasks, notes, documents, and spaces the user accessed directly.
- Order items by recency of access.
- Prefer direct user behavior over inferred importance.

### Exclusion Rules

- Do not include items only because they changed in the background.
- Do not include items only because someone else interacted with them.
- Do not include urgency indicators, unread states, or attention badges by default.
- Do not turn `Recent Work` into a summary dashboard.

### Example Events

- User opened the `Q3 Planning` project.
- User edited the `Launch Checklist` task.
- User viewed the `Brand Notes` document.
- User returned to the `Marketing Workspace`.

### UI Behavior

- Present as a clean, lightweight list or compact section.
- Show item name, item type, and light recency metadata.
- Keep rows visually calm and easy to scan.
- Support fast re-entry with one click.
- Avoid dense labels, warning colors, or status clutter.

### Event Ownership

- Owned by user navigation behavior.
- Generated from access and direct interaction signals.
- Not owned by team activity or system-wide event streams.

### Edge Cases

- If a user opens an item accidentally, it may still appear briefly; this is acceptable if the list self-corrects quickly through recency.
- If an item is deleted or permission is removed, it should disappear from `Recent Work`.
- If the same item is opened repeatedly, it should remain a single recent entry rather than duplicating.

### Future Expansion Considerations

- A small amount of pinning may be useful later, but should not be mixed into default recency.
- Workspace-level filtering could be added if users truly need it, but should stay secondary to simple recency.
- Any personalization should remain minimal and should not require extensive settings.

---

## 2. Notifications

### Purpose

`Notifications` is a filtered attention system. It exists to surface information that reasonably deserves the user's awareness or action.

### User Question Answered

"What needs my attention, or what should I know now?"

### Inclusion Rules

- Include mentions of the user.
- Include assignments to the user.
- Include comments, updates, or changes on work the user is directly involved in when those changes are meaningfully relevant.
- Include due date risks, deadlines, or major status changes when they affect the user's work.
- Include important workspace or team events only when they are relevant to the user.

### Exclusion Rules

- Do not include every workspace event.
- Do not include low-signal edits, passive changes, or routine churn.
- Do not include events only because they are recent.
- Do not use `Notifications` as a backup for weak information architecture elsewhere in the product.
- Do not allow it to become a firehose.

### Example Events

- User was mentioned in a task comment.
- A task was assigned to the user.
- A due date was moved closer on a task the user owns.
- A collaborator commented on a note the user is actively involved in.
- A project the user is responsible for changed to a blocked state.

### UI Behavior

- Present as a focused list of meaningful items.
- Use clear state for new versus previously seen items.
- Support lightweight actions such as opening the source item or marking the notification as seen.
- Keep language direct and plain rather than dramatic.
- Avoid visual overload from excessive badges, icons, or severity markers.

### Event Ownership

- Owned by attention-worthy events tied to user relevance.
- Generated from collaboration, responsibility, and time-sensitive signals.
- Requires explicit product rules for what qualifies as worthy of attention.

### Edge Cases

- A high-value event may also appear in `Recent Activity`; this is valid if it appears in `Notifications` because it needs attention.
- If a user is loosely related to an item but not meaningfully affected, the event should stay out of `Notifications`.
- Bulk edits should not produce bulk notifications unless each event truly matters.

### Future Expansion Considerations

- Notification bundling may become useful if event volume grows, but only if it improves clarity.
- Delivery channels such as email or push should reuse the same qualification rules rather than inventing separate logic.
- User controls may be added later, but they should be narrow and easy to understand.

---

## 3. Recent Activity

### Purpose

`Recent Activity` is an informational system that helps users understand what has changed across their work without demanding attention from every event.

### User Question Answered

"What changed recently?"

### Inclusion Rules

- Include high-signal updates across relevant workspaces, projects, tasks, notes, and team activity.
- Include meaningful collaborative changes even when they do not require direct action.
- Include a broader set of changes than `Notifications`, but a more filtered set than a raw audit log.
- Prefer events that help a user regain context quickly.

High-signal events include:

- Task created
- Task completed
- Task assigned
- Due date changed
- Note created
- Note significantly updated
- Project created
- Member joined

### Exclusion Rules

- Do not include every small edit or system event.
- Do not duplicate the full behavior of `Notifications`.
- Do not optimize for urgency by default.
- Do not let `Recent Activity` become a noisy stream that users must decode manually.
- Do not expose low-level internal change history as product-facing activity.

Low-signal events include:

- Typo corrections
- Read state changes
- Presence updates
- Repeated field edits

### Example Events

- A task was completed in a project the user follows.
- A note was updated by a collaborator.
- Several changes happened on a project the user recently worked in.
- A milestone moved to done.
- A new task was added to an active project the user belongs to.

### UI Behavior

- Present as a calm feed of meaningful changes.
- Prefer concise summaries over verbose event rows.
- Group related activity when possible to reduce repetition.
- Use time-based structure such as `Today`, `Yesterday`, and `Earlier` if needed.
- Keep visual emphasis lower than `Notifications`.

### Event Ownership

- Owned by informational changes across relevant work.
- Generated from product activity events that are important enough to preserve context, but not always important enough to interrupt.
- Acts as the middle layer between navigation memory and attention management.

### Edge Cases

- An event may appear in both `Recent Activity` and `Notifications` if one explains context and the other signals attention.
- If many small updates happen on the same item, they should be summarized rather than listed separately.
- If an item is private, removed, or permission-restricted, related activity should respect visibility rules.

### Future Expansion Considerations

- Smart grouping by item or project may be added if it reduces noise without hiding important context.
- Simple relevance ranking may be useful later, but should remain understandable and mostly invisible.
- `Recent Activity` should never evolve into a second notification center or an analytics dashboard.

---

## Relationship Between the Three Systems

The product should treat these systems as distinct layers:

- `Recent Work` = memory of access
- `Notifications` = signal for attention
- `Recent Activity` = context about change

This gives Zorune a simple mental model:

- Users go to `Recent Work` to continue.
- Users go to `Notifications` to respond.
- Users go to `Recent Activity` to catch up.

The systems can reference the same underlying object, but they should not use the same inclusion logic.

Example:

- A task appears in `Recent Work` because the user opened it yesterday.
- The same task appears in `Notifications` because the user was mentioned today.
- The same task appears in `Recent Activity` because it had a meaningful update this morning.

This overlap is acceptable because each appearance answers a different question.

---

## Event Ownership Summary

To keep the model maintainable, each system should have a clear source of truth:

- `Recent Work` is owned by user access behavior.
- `Notifications` is owned by attention qualification rules.
- `Recent Activity` is owned by informational activity qualification rules.

This separation matters because it prevents product drift.

Without explicit ownership:

- navigation starts to behave like alerts
- notifications start to collect low-value noise
- activity feeds start to become dashboards

The product should resist that drift.

---

## Event Priority

Every event belongs to one of:

Attention
Context
Navigation

---

## Version 1 Implementation Rules

### 1. Recent Work

Included events:

- Project opened
- Task opened
- Note opened
- Workspace opened
- Document opened, if documents are already a distinct object type
- Task edited by the user, if this is already easy to track
- Note edited by the user, if this is already easy to track

Excluded events:

- Items changed by other people
- Background changes
- Mentions
- Assignments
- Comments from others
- Due date changes
- Status changes not caused by the user opening or editing the item
- Presence updates
- Read state changes
- Badges, unread markers, or urgency indicators

Required state:

- `user_id`
- `item_type`
- `item_id`
- `last_accessed_at`

Deferred features:

- Pinning
- Filtering
- Sorting beyond simple recency
- Separate treatment for viewed versus edited items
- Time thresholds for accidental opens
- Personalization settings

### 2. Notifications

Purpose:

- Surface a small set of changes that clearly deserve the user's awareness or action now.
- Do not act as a general activity feed, dashboard, or history log.

Included Version 1 events:

- User mentioned in a comment
- Task assigned to user
- Comment added on an assigned task
- Due date changed on an assigned task

Excluded Version 1 events:

- All workspace activity
- General project updates
- New task created in a project
- Member joined workspace
- Note edits
- Passive status churn
- Typo fixes
- Repeated field changes
- Events included only because they are recent
- Task status changed to blocked
- Project status changed to blocked

Inclusion rules:

- Include only events directly tied to the user.
- Include only events that likely require awareness or follow-up.
- Include only events linked to a visible source item.
- In Version 1, notify only when the user is explicitly targeted or assigned.

Exclusion rules:

- Exclude events that are informational but not attention-worthy.
- Exclude events where the user is not directly targeted or assigned.
- Exclude small or repetitive changes that add noise without changing meaning.
- Exclude broad workspace or project updates.

Required state:

- `user_id`
- `event_type`
- `source_item_type`
- `source_item_id`
- `created_at`
- `is_seen` or `seen_at`

Lifecycle:

- `unread`
- `seen`

Grouping behavior:

- Simple newest-first list
- Optional date labels only
- No smart grouping
- No bundles

Retention behavior:

- Keep unseen notifications visible until seen.
- Keep seen notifications visible in the list until basic age-based cleanup removes old items.
- Do not remove notifications immediately after they are seen.

Deferred features:

- Read state separate from seen
- Archive
- Dismiss
- Notification settings
- Email delivery
- Push delivery
- Priority levels
- Snooze behavior
- Advanced relevance scoring

### 3. Recent Activity

Included events:

- Task created
- Task completed
- Task assigned
- Due date changed
- Task status changed
- Note created
- Note updated, if note edit events are already easy to capture
- Project created
- Member joined workspace

Excluded events:

- Typo corrections, if distinguishable
- Read state changes
- Presence updates
- Repeated field edits as separate feed items
- Low-level audit history
- System or internal events
- Every comment by default
- Notification-specific unread or urgency behavior

Required state:

- `user_id`
- Visibility scope based on item access
- `event_type`
- `source_item_type`
- `source_item_id`
- `created_at`
- `actor_id`, if available

Deferred features:

- Smart grouping by project or item
- Summarization of multiple updates
- Relevance ranking
- Following or subscribing controls
- Advanced filtering
- Feed personalization
- Deduplication beyond basic obvious cases

---

## Product Guardrails

Any future event type should be evaluated with the following questions:

1. What user problem does this solve?
2. Does this need immediate attention, contextual awareness, or simple return navigation?
3. Is this high-signal enough to earn space in the interface?
4. Is there a simpler way to support the same user outcome?
5. Will this still feel calm and understandable six months from now?

If the answer is unclear, the event should not be added until the model is clearer.
