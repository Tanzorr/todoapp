# modules/tasks/tasks.repository.js

## Purpose

Data access layer for tasks. Encapsulates all SQL queries and row transformations. Talks directly to the database via `pool.query()`.

## Exports

- **`findAll()`** (async): Fetch all tasks.
  - **Returns:** Promise resolving to array of task objects (sorted by ID, ascending).

- **`findById(id)`** (async): Fetch a single task by ID.
  - **Parameters:** `id` (number): Task ID.
  - **Returns:** Promise resolving to task object, or `null` if not found.

- **`create(title, description)`** (async): Insert a new task.
  - **Parameters:**
    - `title` (string): Task title (assumed already validated).
    - `description` (string): Optional task description. If falsy, stored as NULL.
  - **Returns:** Promise resolving to the newly created task object (including auto-generated `id`).

- **`update(id, fields)`** (async): Update one or more task fields.
  - **Parameters:**
    - `id` (number): Task ID.
    - `fields` (object): Keys from `{ title, description, done }` with new values.
  - **Returns:** Promise resolving to the updated task object.
  - **Behavior:** Only updates fields present in `fields` object. If `fields` is empty, returns the current task unchanged.

- **`remove(id)`** (async): Delete a task and all its timer entries (cascading).
  - **Parameters:** `id` (number): Task ID.
  - **Returns:** Promise resolving to undefined.

## Behavior / business rules

- **Row-to-object transformation:** Each row from the database is transformed by `rowToTask()` to normalize field names and types:
  - `id` → `id` (unchanged)
  - `title` → `title` (unchanged)
  - `description` → `description` (null becomes empty string `''`)
  - `done` → `done` (MySQL `TINYINT` 0/1 becomes boolean false/true)
  - `created_at` → `createdAt` (camelCase)
  - `updated_at` → `updatedAt` (camelCase)

- **Parameterized queries:** All SQL uses `?` placeholders with parameter arrays to prevent SQL injection.

- **Returned objects:** All methods return task objects in the transformed format (camelCase, booleans, nulls as empty strings).

## Dependencies

- **Imports:** `../../db/pool` (the database connection)
- **Depends on:** Called by `tasks.service.js`

## Notes

- `create()` inserts the row and immediately queries it back to get the auto-generated `id` and any defaults applied by the database.
- `update()` constructs the SQL `SET` clause dynamically based on which fields are provided, avoiding unnecessary updates.
- `remove()` relies on the database foreign-key constraint (ON DELETE CASCADE) to delete associated time entries.
