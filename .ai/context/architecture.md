# Architecture

Where each ontology concept lives. Per-file contracts:
[`backend/specs/`](../../backend/specs/README.md).

## Layers

```
Browser  (index / add / edit / show .html)
  page entry      src/index.js · add.js · edit.js · show.js     wire a page, nothing else
  rendering       src/render.js                                 list page: fetch → TaskItems
  DOM factories   src/dom-elements.js                           create nodes, no fetch
  handlers        src/actions.js · src/action-button.js         click → API → DOM
  timer display   src/timer.js                                  per-TaskItem tick, start/stop
  API adapter     src/api-client.js                             the only fetch() (I-7)
  config / rules  src/constants.js · src/validations.js · src/data.js
        │  HTTP JSON
        ▼
Node / Express  (backend/src)
  routes  →  controller  →  service  →  repository  →  db/pool.js  →  MySQL
              parse req      rules +      SQL only
              send res       validation   (I-10)
  middleware/  not-found, error-handler → ApiError (I-7)
```

**Dependencies point down only.** A repository never throws HTTP-shaped errors
for business rules; a controller never contains SQL; `dom-elements.js` never
calls `fetch`.

## Concept → Code

| Concept | Lives as |
| :--- | :--- |
| `Task` | `tasks` table · `backend/src/modules/tasks/*` · `rowToTask()` maps to camelCase |
| `TimeEntry` | `time_entries` table · `backend/src/modules/timer/timer.repository.js` |
| `Timer` | `timer.service.js` (`findOpenEntry` ⇒ running) · `GET /api/tasks/:id/timer` → `isRunning` |
| `TrackedTime` | `timer.repository.getTotalSeconds()` (SQL `SUM(TIMESTAMPDIFF…)`) |
| `TaskItem` | `render.addTodo()` + `dom-elements.createControls()`; `.stopTimer` property on the node |
| `SelectedTask` | `src/data.js` (`saveTaskId` / `getTaskId`) |
| `ApiError` | `backend/src/middleware/error-handler.js`; thrown as `Error` with `.status`, `.field` |

## API Surface

| Method | Path | Success |
| :--- | :--- | :--- |
| GET | `/health` | 200 |
| GET | `/api/tasks` | 200 `Task[]` |
| GET | `/api/tasks/:id` | 200 `Task` |
| POST | `/api/tasks` | 201 `Task` — body `{ title, description? }` |
| PUT | `/api/tasks/:id` | 200 `Task` — body `{ title?, description?, done? }` |
| DELETE | `/api/tasks/:id` | 204 |
| GET | `/api/tasks/:id/timer` | 200 `{ taskId, totalSeconds, isRunning }` |
| POST | `/api/tasks/:id/timer/start` | 201 · 409 if running |
| POST | `/api/tasks/:id/timer/stop` | 200 `{ …, elapsedSeconds }` · 409 if stopped |

Errors: 400 invalid input, 404 missing task/route, 409 timer state, 500 otherwise.

## ADRs

Decisions made before this file existed are recorded with their original date.

### ADR-001 — Timer state is derived from `time_entries`, not stored
**2026-07-15 · Accepted.** A `is_running` column can disagree with the rows it
summarises; an open row cannot. Cost: one extra query per `GET …/timer`.

### ADR-002 — Raw SQL through `mysql2`, no ORM
**2026-07-15 · Accepted.** Two tables do not earn an ORM, and raw SQL keeps the
backend readable for V-4. Cost: hand-written row mapping in each repository.

### ADR-003 — Vanilla JS, no build step
**2026-04 · Accepted.** The project is a learning codebase (V-4). Cost: no
TypeScript, no tree-shaking; frontend needs a static server for ES modules.

### ADR-004 — CommonJS backend, ES-module frontend
**2026-07-15 · Accepted.** Express/dotenv examples and `require` keep the
backend conventional for Node 20. Cost: two module systems in one repo — code
cannot be shared between them without a copy.

### ADR-005 — One fetch adapter; errors surface as `alert()`
**2026-07-15 · Accepted.** All calls go through `src/api-client.js`, which
throws `Error(error.message)`. `alert` matches the existing UX. Cost: blocking
dialogs; replaced if inline error display is ticketed.

### ADR-006 — Separate add / edit / show pages, not a modal
**2026-06-29 · Accepted** (commit `9668892`), superseding the modal plan
(TASK-003). The reason was not recorded at the time. Cost: SelectedTask must be
carried between pages (`localStorage`, see Q-3).

### ADR-007 — No version prefix; `/api/v2` only on a breaking change
**2026-07-15 · Accepted.** Additive changes (new optional fields, endpoints)
are not breaking.

### ADR-008 — Per-file backend specs; code wins on conflict
**2026-07-16 · Accepted.** `backend/specs/` mirrors `backend/src/` (V-5). When
spec and code disagree, the code is right and the spec is fixed in the same
change. Cost: manual upkeep on every exported-behaviour change.

### ADR-009 — `.ai/` replaces `tasks/` as the work-tracking layer
**2026-10-29 · Accepted.** `tasks/` was gitignored, so specs were not shared or
reviewed. `.ai/` is committed and traceable. Cost: legacy specs summarised, not
copied — originals stay in the local `tasks/` folder until deleted.
