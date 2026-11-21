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
| [TASK-024](TASK-024-tickets-for-readers.md) | A ticket reads clearly to someone who has never seen one | `in-progress` | P2 | V-4 | TASK-023 |
| [TASK-025](TASK-025-users-and-auth.md) | Users: registration, sign-in and private Tasks | `in-progress` | P1 | V-6 | — |

## Order

```
010 ─┬─► 009 ─┬─► 012 ─────────────┐
     │        ├─► 011 ─┐           ▼
     │        ├─► 015 ─┴─► 020 ─► 021
     │        └─► 016
     └─► 014
013  (independent, do first)
025 ───► 026   (025's test harness is reusable by 014)
017 ───► 018 ─┬─► 019
              ├─► 022
              └─► 023 ───► 024
```

020 is the spec and 021 builds it; both close together.

## Conventions

- **ID** `TASK-NNN`, never reused or renumbered — numbering is not order; the
  `Depends on` column is.
- **Filename** `TASK-NNN-<kebab-slug>.md`.
- **Status** and **Priority** values — [Reading a Ticket](#reading-a-ticket).
- Every ticket traces to a driver in [`../business/VALUE.md`](../business/VALUE.md).
- When this table and a ticket disagree, the ticket wins.

## Reading a Ticket

What each field and part of a ticket tells a reader. The docs page shows the text
under that field or heading; a part added here appears there with no code change.

| Part | Tells you |
| :--- | :--- |
| Status | Where the work is: `planned` → `in-progress` → `done`, or `blocked` with the reason. |
| Priority | How much it matters: P0 blocks everything · P1 required · P2 quality · P3 nice to have. |
| Value driver | Which project goal it serves — see [`VALUE.md`](../business/VALUE.md). |
| Depends on | Tickets that must be finished first. |
| Created | The day the ticket was written. |
| Goal | What changes once it is done, in plain words. |
| Ontology Touchpoints | Which things in the app's data model it touches, and which rules (`I-n`) must stay true. |
| Decisions | Choices the owner confirms before building starts, each with the proposed answer. |
| Acceptance Criteria | The checks that prove it is done. A ticked box has been checked by running it. |
| Out of Scope | What it deliberately leaves out, so the work stays small. |
| Notes | Working details for whoever builds it: files, traps, how it was checked. |
| Outcome | What was actually built, written when the ticket is archived. |
