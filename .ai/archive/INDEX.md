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
| — | | | | |

## How to Archive

1. Fill the ticket's **Outcome**: what was built, deviations, how it was verified, follow-ups.
2. Set `Status: done`.
3. `git mv .ai/backlog/TASK-NNN-*.md .ai/archive/`
4. Move its row from the backlog index to the table above.

An archived ticket is **immutable**. If its decision was wrong, open a new
ticket that references it.
