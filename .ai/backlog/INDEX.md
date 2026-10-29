# Backlog

Planned work. A ticket moves to [`../archive/`](../archive/INDEX.md) when done.
New tickets follow [`TEMPLATE.md`](TEMPLATE.md).

## Open

| ID | Title | Status | Priority | Value | Depends on |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [TASK-010](TASK-010-track-tasks-module.md) | Put the backend tasks module under version control | `planned` | P0 | V-2, V-5 | — |
| [TASK-013](TASK-013-untrack-env.md) | Stop tracking `backend/.env` | `planned` | P0 | V-5 | — |
| [TASK-009](TASK-009-frontend-api-client.md) | Frontend reads and writes through the API (M5) | `in-progress` | P1 | V-1, V-2 | TASK-010 |
| [TASK-012](TASK-012-green-check.md) | `npm run check` passes | `planned` | P1 | V-4 | TASK-009 |
| [TASK-011](TASK-011-timer-ui-follows-server.md) | Timer UI always matches the server | `planned` | P1 | V-1 | TASK-009 |
| [TASK-014](TASK-014-api-smoke-tests.md) | Automated API checks with `node:test` | `planned` | P2 | V-1, V-5 | TASK-010 |
| [TASK-015](TASK-015-one-title-rule.md) | One title-length rule on both sides | `planned` | P2 | V-3 | TASK-009 |
| [TASK-016](TASK-016-readme-current.md) | Root README describes the current app | `planned` | P3 | V-4 | TASK-009 |

## Order

```
010 ─┬─► 009 ─┬─► 012
     │        ├─► 011
     │        ├─► 015
     │        └─► 016
     └─► 014
013  (independent, do first)
```

## Conventions

- **ID** `TASK-NNN`, never reused or renumbered — numbering is not order; the
  `Depends on` column is.
- **Filename** `TASK-NNN-<kebab-slug>.md`.
- **Status** `planned` → `in-progress` → `done`, or `blocked` with the reason.
- **Priority** P0 blocks everything · P1 required · P2 quality · P3 nice to have.
- Every ticket traces to a driver in [`../business/VALUE.md`](../business/VALUE.md).
- When this table and a ticket disagree, the ticket wins.
