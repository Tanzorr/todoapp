# TASK-009 — Frontend reads and writes through the API (M5)

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented, uncommitted on `prettify-show` |
| **Priority** | P1 |
| **Value driver** | `V-1`, `V-2` |
| **Depends on** | `TASK-010` (the API it calls must be in git) |
| **Created** | 2026-07-15 (migrated from `tasks/planned/frontend-api-client-adapter.md`) |

## Goal

Tasks and tracked time survive a reload because every page reads and writes
through the API; the browser keeps no task data of its own.

## Ontology Touchpoints

**Concepts:** `Task`, `TimeEntry`, `Timer`, `SelectedTask`, `ApiError`
**Invariants that must hold:** `I-1`, `I-4`, `I-5`, `I-7`, `I-8`
**New concepts:** none.

## Acceptance Criteria

- [ ] AC-1 — Adding on `add.html` creates a `tasks` row; it is listed on `index.html` (T-1, T-9).
- [ ] AC-2 — Deleting removes the row and its `time_entries` (T-7, T-11).
- [ ] AC-3 — Editing on `edit.html` updates title and description.
- [ ] AC-4 — Start/stop writes `time_entries`; the list shows the server total (T-4…T-6).
- [ ] AC-5 — `rg 'fetch\(' src` hits only `api-client.js`; no task data in `localStorage` (only `taskId`).
- [ ] AC-6 — Pages work from a static server with no build step (S-3).

## Out of Scope

- Lint/format failures introduced by top-level `await` — TASK-012.
- Running-timer display after reload; `done` while running — TASK-011.
- Validation on the edit page; length mismatch — TASK-015.

## Notes

`src/action-button.js:25` reads `localStorage.getItem('taskId')` directly
instead of `getTaskId()` from `data.js` — fix here, it is the same concept.
`validations.js` still names its parameter `taskStoreArray`, and `add.js` passes
`[]`, so the duplicate-title check is dead code — decide in TASK-015.
