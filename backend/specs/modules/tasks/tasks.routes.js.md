# modules/tasks/tasks.routes.js

## Purpose

Express router definition for the tasks API. Mounts HTTP route handlers and nests the timer subrouter under task ID resources.

## Exports

- **router** (Express Router): Handles all task-related routes under `/api/tasks`.

## Routes

All routes assume a base path of `/api/tasks`.

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | `listTasks` | List all tasks. |
| GET | `/:id` | `getTask` | Get a single task by ID. |
| POST | `/` | `createTask` | Create a new task. |
| PUT | `/:id` | `updateTask` | Update a task. |
| DELETE | `/:id` | `deleteTask` | Delete a task. |
| — | `/:taskId/timer/*` | (nested) | Timer subrouter (see `timer.routes.js`). |

## Behavior / business rules

- **Nesting:** Timer routes are nested under `/:taskId/timer` using `router.use('/:taskId/timer', timerRoutes)`.
- **Merge params:** The timer subrouter must use `mergeParams: true` to access the `:taskId` parameter from the parent router.
- **Task ID validation:** IDs are validated in the controller before calling the service.

## Dependencies

- **Imports:** `express`, `./tasks.controller`, `../timer/timer.routes`
- **Depends on:** Mounted in `app.js` at `/api/tasks`, behind `authenticate` — every route here, timer routes included, needs a valid access token.

## Notes

- The nested timer router at `/:taskId/timer` will add routes like `/:taskId/timer/`, `/:taskId/timer/start`, and `/:taskId/timer/stop` (see `timer.routes.js` for full details).
