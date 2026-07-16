# modules/timer/timer.controller.js

## Purpose

HTTP request handlers for the timer API. Parses request parameters, calls the service layer, and sends HTTP responses. All handlers catch errors and pass them to `next(err)`.

## Exports

- **`startTimer(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.params.taskId` (string, from URL).
  - **Validation:** Calls `validateTaskId(req.params.taskId)`.
  - **Response:** `201 Created` with timer entry object:
    ```json
    {
      "entryId": <number>,
      "taskId": <number>,
      "startedAt": "<ISO8601>"
    }
    ```
  - **Errors:** 400 (invalid task ID), 404 (task not found), 409 (timer already running).

- **`stopTimer(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.params.taskId` (string, from URL).
  - **Validation:** Calls `validateTaskId(req.params.taskId)`.
  - **Response:** `200 OK` with timer entry object:
    ```json
    {
      "entryId": <number>,
      "taskId": <number>,
      "startedAt": "<ISO8601>",
      "stoppedAt": "<ISO8601>",
      "elapsedSeconds": <number>
    }
    ```
  - **Errors:** 400 (invalid task ID), 404 (task not found), 409 (no running timer).

- **`getTimerTotal(req, res, next)`** (async handler)
  - **Parameters (from request):** `req.params.taskId` (string, from URL).
  - **Validation:** Calls `validateTaskId(req.params.taskId)`.
  - **Response:** `200 OK` with total object:
    ```json
    {
      "taskId": <number>,
      "totalSeconds": <number>,
      "isRunning": <boolean>
    }
    ```
  - **Errors:** 400 (invalid task ID), 404 (task not found).

## Behavior / business rules

- **Error handling:** All async errors are caught in try-catch and routed via `next(err)` to the global error handler.
- **Validation:** Task ID is validated before calling the service.
- **Status codes:** 201 for start (created), 200 for stop and get (success), 400 for validation, 404 for not found, 409 for conflict.

## Dependencies

- **Imports:** `./timer.service`, `./timer.validation`
- **Depends on:** Called by `timer.routes.js`

## Notes

- The `:taskId` parameter comes from the parent route (from `tasks.routes.js` which nests this router).
- Controller logic is minimal — extraction and validation only; orchestration is in the service.
