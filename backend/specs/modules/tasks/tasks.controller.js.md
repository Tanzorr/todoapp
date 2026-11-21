# modules/tasks/tasks.controller.js

## Purpose

HTTP request handlers (route controllers) for the tasks API. Parses request data, calls the service layer, and sends HTTP responses. Every handler catches errors and passes them to `next(err)`.

## Exports

- **`listTasks(req, res, next)`** (async handler)
  - **Response:** `200 OK` with array of task objects.

- **`getTask(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.params.id` (string).
  - **Validation:** Calls `validateId(req.params.id)`.
  - **Response:** `200 OK` with task object.
  - **Errors:** 400 (invalid ID), 404 (task not found).

- **`createTask(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.body.title` (string), `req.body.description` (optional string).
  - **Response:** `201 Created` with newly created task object.
  - **Errors:** 400 (invalid title).

- **`updateTask(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.params.id` (string), `req.body.{title?, description?, done?}`.
  - **Validation:** Calls `validateId(req.params.id)`.
  - **Response:** `200 OK` with updated task object.
  - **Errors:** 400 (invalid ID or title), 404 (task not found).

- **`deleteTask(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.params.id` (string).
  - **Validation:** Calls `validateId(req.params.id)`.
  - **Response:** `204 No Content` (no body).
  - **Errors:** 400 (invalid ID), 404 (task not found).

## Behavior / business rules

- **Owner:** every handler passes `req.user.id` (set by `authenticate`) to the service, which scopes the work to that User (I-11). Without a valid access token the request never reaches here — `401`.
- **Error handling:** Every handler wraps its async work in try-catch and calls `next(err)` on exception. This routes errors to the global error handler middleware.
- **Validation:** ID validation happens in the controller before calling the service.
- **Status codes:** 201 for create, 200 for success, 204 for successful delete (no content), 400 for validation, 404 for not found — including another User's Task.

## Dependencies

- **Imports:** `./tasks.service`, `./tasks.validation`
- **Depends on:** Called by `tasks.routes.js`

## Notes

- All async/await errors are caught; this prevents unhandled promise rejections.
- The controller does minimal logic — it extracts request data, validates it, and delegates to the service.
