# TASK-010 — Put the backend tasks module under version control

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P0 |
| **Value driver** | `V-2`, `V-5` |
| **Depends on** | — |
| **Created** | 2026-10-29 |

## Goal

A fresh clone starts the API. Today `.gitignore` line `tasks/` matches every
directory named `tasks`, including `backend/src/modules/tasks/`, so `app.js`
`require`s a module that is not in the repository.

## Ontology Touchpoints

**Concepts:** `Task`
**Invariants that must hold:** all — no behaviour changes.
**New concepts:** none.

## Acceptance Criteria

- [ ] AC-1 — `.gitignore` ignores only the root `tasks/` folder (`/tasks/`).
- [ ] AC-2 — `git ls-files backend/src/modules/tasks` lists all five files.
- [ ] AC-3 — In a fresh clone, `cd backend && npm install && npm start` reaches `/health`.

## Out of Scope

- Deleting the local `tasks/` folder — its content now lives in `.ai/` (ADR-009);
  removing it is the owner's call.
- Specs for the tasks module in `backend/specs/modules/tasks/` — they are also
  missing; raise a ticket if wanted.
