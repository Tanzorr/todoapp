# modules/tasks/tasks.service.js

## Purpose

Business logic for Tasks. Every function acts for one User, given as `userId` from `req.user.id` (I-11).

## Exports

- **`listTasks(userId)`** (async): The User's Tasks.
- **`getTask(id, userId)`** (async): The Task.
  - **Throws:** `404` `Task not found` if it does not exist or is another User's.
- **`createTask(userId, title, description)`** (async): Validates and trims the title, creates the Task for the User.
  - **Throws:** `400` with `field: 'title'`.
- **`updateTask(id, userId, fields)`** (async): Updates `{ title?, description?, done? }`.
  - **Behavior:** a given `title` is validated and trimmed. A truthy `done` closes the open TimeEntry first (ADR-013); reopening does not resume it.
  - **Throws:** `404` as above; `400` for an invalid title.
- **`deleteTask(id, userId)`** (async): Deletes the Task and, by cascade, its TimeEntries.
  - **Throws:** `404` as above.

## Behavior / business rules

- **404, never 403:** another User's Task answers exactly like a missing one, so ids reveal nothing (I-11).
- **Existence check first** in get, update and delete.
- Errors carry `err.status` (and `err.field` for validation) for the error handler.

## Dependencies

- **Imports:** `./tasks.repository`, `../timer/timer.repository`, `./tasks.validation`
- **Called by:** `tasks.controller.js`

## Notes

- No transaction: a Task deleted between the existence check and the update makes the update return `null`.
