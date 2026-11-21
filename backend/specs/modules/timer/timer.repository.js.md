# modules/timer/timer.repository.js

## Purpose

Data access for `time_entries`. A TimeEntry has no owner column; every query joins `tasks` and filters `tasks.user_id = ?`, so a TimeEntry belongs to whoever owns its Task (ADR-018, I-11).

## Exports

- **`findOpenEntry(taskId, userId)`** (async): The Task's open entry (raw row) if the Task is the User's, else `null`.
- **`createEntry(taskId, userId)`** (async): Starts a TimeEntry with `started_at = NOW()`.
  - **Query:** `INSERT … SELECT id, NOW() FROM tasks WHERE id = ? AND user_id = ?` — inserts nothing for another User's Task.
  - **Returns:** the new raw row, or `null` when nothing was inserted.
- **`closeEntry(entryId, userId)`** (async): Sets `stopped_at = NOW()` on the entry if its Task is the User's.
  - **Returns:** the raw row after the update, or `null`.
- **`getTotalSeconds(taskId, userId)`** (async): Sum of `TIMESTAMPDIFF(SECOND, started_at, COALESCE(stopped_at, NOW()))` over the Task's entries; `0` when there are none or the Task is not the User's.

## Behavior / business rules

- **Open entry** = `stopped_at IS NULL` (I-2, I-3).
- Rows are returned raw (snake_case); `timer.service.js` shapes the response.
- Parameterized queries only (I-10).

## Dependencies

- **Imports:** `../../db/pool`
- **Called by:** `timer.service.js`; `tasks.service.js` to close the open entry on `done` (ADR-013)

## Notes

- Deleting a Task removes its entries through `ON DELETE CASCADE`, not here.
