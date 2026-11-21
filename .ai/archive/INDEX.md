# Archive

Completed and cut tickets. A ticket arrives here from
[`../backlog/`](../backlog/INDEX.md) once the Definition of Done in
[`../context/conventions.md`](../context/conventions.md) holds.

## Before `.ai/` (TASK-001…008)

Done under the old gitignored `tasks/` folder (ADR-009). IDs were assigned on
migration; the original specs exist only in the local `tasks/` folder, so there
are no ticket files here and outcomes come from the code and git history.

| ID | Title | Date | Value | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| TASK-001 | Independent timer per task | 2026-06 | V-1 | `createTimer()` closure per TaskItem; global timer state removed from `data.js`. Source: `files-dividing-refactor.md` |
| TASK-002 | Stop the timer before removing the row | 2026-06 | V-1 | `stopTimer?.()` before `remove()` in `actions.deleteTodoItem` — still true (I-5). Source: `fix-delete-timer-cleanup.md` |
| TASK-003 | Modal form for add / edit | 2026-06 | V-3 | **Superseded** by separate add/edit/show pages in `9668892` (ADR-006). No modal in the code. Source: `modal-form-for-add-edit.md` |
| TASK-004 | SDD foundation: strategy + tactical specs (M0) | 2026-07-14 | V-5 | `tasks/strategy/*` written; now folded into `.ai/` (ADR-009). Source: `node-mysql-sdd-framework-plan.md` |
| TASK-005 | Backend skeleton, `/health`, error middleware (M1) | 2026-07-15 | V-2 | `backend/src/app.js`, `server.js`, `middleware/*`, `config/env.js`. Source: `backend-mvp-bootstrap.md` |
| TASK-006 | MySQL schema v1 + migration runner (M2) | 2026-07-15 | V-2 | `001_init.sql` (`tasks` incl. `description`, `time_entries` with cascade), `db/migrate.js`. Source: `backend-db-schema-v1.md` |
| TASK-007 | Tasks + Timer REST API v1 (M3, M4) | 2026-07-16 | V-1, V-2 | Endpoints in `architecture.md` → API Surface; specs in `backend/specs/` (`66b3eb1`). Tasks module untracked by mistake → TASK-010. Source: `backend-api-contract-v1.md` |
| TASK-008 | Beginner-friendly fixes to the localStorage store | 2026-06-26 | V-4 | **Cut** — the `localStorage` task store it fixed was removed by TASK-009. The dead duplicate check it found carries on in TASK-015. Source: `beginner-friendly-improvements.md` |

## Since `.ai/`

| ID | Title | Completed | Value | Outcome |
| :--- | :--- | :--- | :--- | :--- |
| [TASK-010](TASK-010-track-tasks-module.md) | Put the backend tasks module under version control | 2026-11-05 | V-2, V-5 | `.gitignore` ignores only root `/tasks/`; all five module files tracked; a fresh clone reaches `/health`. |
| [TASK-009](TASK-009-frontend-api-client.md) | Frontend reads and writes through the API (M5) | 2026-11-05 | V-1, V-2 | Every page reads and writes through `src/api-client.js`; `localStorage` holds only `taskId`. |
| [TASK-012](TASK-012-green-check.md) | `npm run check` passes | 2026-11-05 | V-4 | `ecmaVersion: 2022` parses top-level `await`; three files formatted in their own commit; `npm run check` exits 0. |
| [TASK-015](TASK-015-one-title-rule.md) | One title-length rule on both sides | 2026-11-05 | V-3 | Add and edit share `taskValidation`: 1–200 chars after trim (I-6). Dead duplicate check removed, so no ADR. |
| [TASK-011](TASK-011-timer-ui-follows-server.md) | Timer UI always matches the server | 2026-11-05 | V-1 | `done: true` closes the open TimeEntry server-side (ADR-013, Q-2); the row re-reads `GET …/timer` after every action and keeps ticking after a reload. |

## How to Archive

1. Fill the ticket's **Outcome**: what was built, deviations, how it was verified, follow-ups.
2. Set `Status: done`.
3. `git mv .ai/backlog/TASK-NNN-*.md .ai/archive/`
4. Move its row from the backlog index to the table above.

An archived ticket is **immutable**. If its decision was wrong, open a new
ticket that references it.
