# modules/timer/timer.routes.js

## Purpose

Express router definition for the timer API. Handles timer start/stop/query operations nested under a task resource.

## Exports

- **router** (Express Router with `mergeParams: true`): Handles timer routes under `/api/tasks/:taskId/timer`.

## Routes

All routes assume a base path of `/api/tasks/:taskId/timer` (nested from tasks router).

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | `getTimerTotal` | Get total elapsed time and running status for a task. |
| POST | `/start` | `startTimer` | Start a timer for a task. |
| POST | `/stop` | `stopTimer` | Stop the running timer for a task. |

## Behavior / business rules

- **Router configuration:** Created with `mergeParams: true` so the `:taskId` parameter from the parent router is accessible.
- **Nesting:** This router is mounted in `tasks.routes.js` via `router.use('/:taskId/timer', timerRoutes)`.
- **Parameter passing:** The `:taskId` parameter is extracted in the controller via `req.params.taskId`.

## Dependencies

- **Imports:** `express`, `./timer.controller`
- **Depends on:** Mounted by `tasks.routes.js` at `/:taskId/timer`.

## Notes

- The `mergeParams: true` configuration is critical; without it, the timer handler would not have access to `:taskId` from the parent route.
