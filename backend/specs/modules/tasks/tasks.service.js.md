# modules/tasks/tasks.service.js

## Purpose

Business logic layer for tasks. Handles validation, error checking, and orchestration between controller and repository. All task-related business rules live here.

## Exports

- **`listTasks()`** (async): Fetch all tasks.
  - **Returns:** Promise resolving to array of task objects.

- **`getTask(id)`** (async): Fetch a single task by ID.
  - **Parameters:** `id` (number): Task ID (assumed already validated).
  - **Returns:** Promise resolving to task object.
  - **Throws:** Error with `status: 404`, `message: "Task not found"` if task does not exist.

- **`createTask(title, description)`** (async): Create a new task.
  - **Parameters:**
    - `title` (string): Task title.
    - `description` (string): Optional description.
  - **Returns:** Promise resolving to newly created task object.
  - **Validates:** Title via `validateTitle(title)`.
  - **Behavior:** Title is trimmed before insertion.
  - **Throws:** Validation error (400) if title is invalid.

- **`updateTask(id, fields)`** (async): Update task fields.
  - **Parameters:**
    - `id` (number): Task ID.
    - `fields` (object): Fields to update from `{ title?, description?, done? }`.
  - **Returns:** Promise resolving to updated task object.
  - **Throws:** Error with `status: 404` if task not found. Validation error (400) if title is invalid.
  - **Behavior:** If `fields.title` is provided, it is validated and trimmed.

- **`deleteTask(id)`** (async): Delete a task.
  - **Parameters:** `id` (number): Task ID.
  - **Returns:** Promise resolving to undefined.
  - **Throws:** Error with `status: 404` if task not found.

## Behavior / business rules

- **Validation on create/update:** Title is always validated and trimmed before being sent to the repository.
- **Existence checks:** Both `getTask()` and `deleteTask()` verify the task exists; if not, throw a 404.
- **Update safety:** `updateTask()` fetches the task first to ensure it exists, then updates it.
- **Error format:** Custom errors have `err.status` (HTTP status code) set; the error handler middleware reads this.

## Dependencies

- **Imports:** `./tasks.repository`, `./tasks.validation`
- **Depends on:** Called by `tasks.controller.js`

## Notes

- No database transaction logic; if `updateTask()` fetches the task but another request deletes it between the fetch and update, the update will affect 0 rows (handled by repository returning the old task state).
