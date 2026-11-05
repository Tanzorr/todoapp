# TASK-010 — Put the backend tasks module under version control

| Field | Value |
| :--- | :--- |
| **Status** | `done` |
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

- [x] AC-1 — `.gitignore` ignores only the root `tasks/` folder (`/tasks/`).
- [x] AC-2 — `git ls-files backend/src/modules/tasks` lists all five files.
- [x] AC-3 — In a fresh clone, `cd backend && npm install && npm start` reaches `/health`.

## Out of Scope

- Deleting the local `tasks/` folder — its content now lives in `.ai/` (ADR-009);
  removing it is the owner's call.
- Specs for the tasks module in `backend/specs/modules/tasks/` — they are also
  missing; raise a ticket if wanted.

---

## Outcome

**Completed:** 2026-11-05
**What was built:** `.gitignore` line is `/tasks/`; `backend/src/modules/tasks/*` committed (`0684106`).
**Deviations from the plan:** Out of Scope calls the task-module specs missing. They exist locally, hidden by the same rule, so they show as untracked after the fix; committed under TASK-011, which has to change one.
**Verified how:** AC-2: `git ls-files backend/src/modules/tasks` lists 5 files. AC-3: `git clone`, `npm install`, `PORT=3999 npm start` (3000 was busy), `curl /health` → `{"status":"ok"}`, no `.env` present.
**Follow-ups raised:** none.
