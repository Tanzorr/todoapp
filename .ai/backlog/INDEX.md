# Backlog

Planned work. A ticket moves to [`../archive/`](../archive/INDEX.md) when done.
New tickets follow [`TEMPLATE.md`](TEMPLATE.md).

## Open

| ID | Title | Status | Priority | Value | Depends on |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [TASK-013](TASK-013-untrack-env.md) | Stop tracking `backend/.env` | `planned` | P0 | V-5 | — |
| [TASK-014](TASK-014-api-smoke-tests.md) | Automated API checks with `node:test` | `planned` | P2 | V-1, V-5 | TASK-010 |
| [TASK-016](TASK-016-readme-current.md) | Root README describes the current app | `planned` | P3 | V-4 | TASK-009 |
| [TASK-017](TASK-017-docs-page.md) | One docs page rendered from `.ai/` | `in-progress` | P2 | V-4, V-5 | — |
| [TASK-018](TASK-018-docs-pages-search.md) | Docs: one page per section, search and pages for long lists | `in-progress` | P2 | V-4, V-5 | TASK-017 |
| [TASK-019](TASK-019-docs-site-map.md) | Site map on the docs page | `in-progress` | P3 | V-4 | TASK-018 |
| [TASK-020](TASK-020-redesign-task-pages.md) | Redesign the task pages | `planned` | P2 | V-3, V-1 | TASK-011, TASK-015 |
| [TASK-021](TASK-021-implement-task-pages-redesign.md) | Implement the task-pages redesign | `planned` | P2 | V-3, V-1 | TASK-011, TASK-012, TASK-015 |
| [TASK-022](TASK-022-docs-entities-page.md) | Entities page on the docs site | `in-progress` | P2 | V-4 | TASK-018 |
| [TASK-023](TASK-023-docs-file-view.md) | Docs: open any `.ai/` markdown file rendered | `in-progress` | P2 | V-4 | TASK-018 |

## Order

```
010 ─┬─► 009 ─┬─► 012 ─────────────┐
     │        ├─► 011 ─┐           ▼
     │        ├─► 015 ─┴─► 020 ─► 021
     │        └─► 016
     └─► 014
013  (independent, do first)
017 ───► 018 ─┬─► 019
              ├─► 022
              └─► 023
```

020 is the spec and 021 builds it; both close together.

## Conventions

- **ID** `TASK-NNN`, never reused or renumbered — numbering is not order; the
  `Depends on` column is.
- **Filename** `TASK-NNN-<kebab-slug>.md`.
- **Status** `planned` → `in-progress` → `done`, or `blocked` with the reason.
- **Priority** P0 blocks everything · P1 required · P2 quality · P3 nice to have.
- Every ticket traces to a driver in [`../business/VALUE.md`](../business/VALUE.md).
- When this table and a ticket disagree, the ticket wins.
