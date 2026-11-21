# modules/tasks/tasks.repository.js

## Purpose

Data access layer for tasks. Every query is scoped to one User (I-11): a Task of another User is invisible here, exactly like a missing one.

## Exports

- **`findAll(userId)`** (async): The User's Tasks, by `id` ascending.
- **`findById(id, userId)`** (async): The Task, or `null` when it does not exist **or belongs to another User**.
- **`create(userId, title, description)`** (async): Inserts a Task owned by `userId`.
  - `title` is assumed validated and trimmed; a falsy `description` is stored as NULL.
  - **Returns:** the new Task.
- **`update(id, userId, fields)`** (async): Updates any of `{ title, description, done }` present in `fields`, only on the User's Task.
  - **Returns:** the Task after the update (`null` if it is not the User's). With no fields, returns it unchanged.
- **`remove(id, userId)`** (async): Deletes the User's Task; MySQL cascades to its TimeEntries. Another User's id deletes nothing.

## Behavior / business rules

- **Row mapping** (`rowToTask()`): `description` NULL → `''`; `done` 0/1 → boolean; `created_at`/`updated_at` → `createdAt`/`updatedAt`. `user_id` is not returned.
- **Scoping:** every statement has `user_id = ?` in its `WHERE`, so a missed check in the service still cannot reach another User's row.
- **Parameterized queries** only (I-10). `update()` builds its `SET` list from fixed column names, never from input.

## Dependencies

- **Imports:** `../../db/pool`
- **Called by:** `tasks.service.js`, `timer.service.js`
