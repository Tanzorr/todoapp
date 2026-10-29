# modules/timer/timer.repository.js

## Purpose

Data access layer for timer entries. Encapsulates all SQL queries on the `time_entries` table.

## Exports

- **`findOpenEntry(taskId)`** (async): Find the currently running timer for a task, if any.
  - **Parameters:** `taskId` (number): Task ID.
  - **Returns:** Promise resolving to a time entry object (raw database row), or `null` if no open timer.
  - **Query:** `SELECT * FROM time_entries WHERE task_id = ? AND stopped_at IS NULL LIMIT 1`.

- **`createEntry(taskId)`** (async): Create a new timer entry (starts the timer).
  - **Parameters:** `taskId` (number): Task ID.
  - **Returns:** Promise resolving to the newly created time entry object (with auto-generated `id`, `started_at` set to current time).
  - **Query:** Inserts a row with `task_id` and `started_at = NOW()`, then fetches it back.

- **`closeEntry(entryId)`** (async): Stop a running timer.
  - **Parameters:** `entryId` (number): Time entry ID.
  - **Returns:** Promise resolving to the updated time entry object with `stopped_at` set to current time.
  - **Query:** Updates the row, setting `stopped_at = NOW()`, then fetches it back.

- **`getTotalSeconds(taskId)`** (async): Calculate total elapsed time for a task across all completed timers, plus the current running timer (if any).
  - **Parameters:** `taskId` (number): Task ID.
  - **Returns:** Promise resolving to `{ total: <number> }`, where `total` is the sum in seconds. If no entries exist, returns `0`.
  - **Behavior:** Uses MySQL `TIMESTAMPDIFF(SECOND, ...)` and `COALESCE(stopped_at, NOW())` so running timers count from their start to the current moment.

## Behavior / business rules

- **Open entry:** A "running" timer is a row with `stopped_at IS NULL`.
- **Closed entry:** A "completed" timer is a row with `stopped_at IS NOT NULL`.
- **Total calculation:** Running timers are included in the total by using `COALESCE(stopped_at, NOW())` — if `stopped_at` is NULL, use the current time.
- **Return format:** `createEntry()` and `closeEntry()` return raw database rows (snake_case column names, DATETIME strings). Transformation to the service's format happens in `timer.service.js`.

## Dependencies

- **Imports:** `../../db/pool`
- **Depends on:** Called by `timer.service.js`

## Notes

- All queries use parameterized statements to prevent SQL injection.
- Queries immediately fetch the row back after INSERT or UPDATE to ensure the client sees the actual database state (including any defaults or computed columns).
- No cascading deletes are enforced here; the schema constraint in the migration (`ON DELETE CASCADE`) handles it.
