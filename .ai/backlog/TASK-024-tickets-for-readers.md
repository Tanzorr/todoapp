# TASK-024 — A ticket reads clearly to someone who has never seen one

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented; closes once `npm run check` is green (TASK-012) |
| **Priority** | P2 |
| **Value driver** | `V-4` |
| **Depends on** | `TASK-023` |
| **Created** | 2026-11-07 |

## Goal

A ticket shown on the docs page (TASK-023) is written for the agent: `P2`, `V-4`,
"Acceptance Criteria" and a long Notes section mean nothing to a viewer of the
project. The ticket page says what each part tells the reader, shows how much of it
is checked, and folds the builder's notes, so a non-developer can follow a ticket.

## Ontology Touchpoints

**Concepts:** none — documentation tooling.
**Invariants that must hold:** `I-8` in spirit — file text reaches the DOM as text.
**New concepts:** none.

## Acceptance Criteria

- [x] AC-1 — [`INDEX.md`](INDEX.md) has a `## Reading a Ticket` table, one row per
      field and part of [`TEMPLATE.md`](TEMPLATE.md), in plain words. Status and
      Priority are defined there only — the Conventions list points to it.
- [x] AC-2 — A file whose first block is a `Field | Value` table shows its fields as
      facts, each with its row's text; Status is coloured as on the board.
- [x] AC-3 — Each `##` part named in the table shows its text under the heading.
- [x] AC-4 — A part with boxes shows "N of M checked" and a bar.
- [x] AC-5 — Parts listed in `docs/config.js` (`Notes`) start folded and open on a click.
- [x] AC-6 — Hovering a ref or concept link shows its card's title (`V-4` → "Learnable
      codebase").
- [x] AC-7 — Board and Archive cards with a ticket file link to it as "Read the ticket →".
- [x] AC-8 — No `Reading a Ticket` table: the ticket still renders, with a warning.
- [x] AC-9 — No new dependency; `rg -n innerHTML docs` hits nothing; `docs/*.js` passes
      `eslint` and `prettier --check`.

## Out of Scope

- Translating tickets — the table is one place to do it if wanted.
- Folding parts other tickets add (TASK-021's `Steps`) — only the config list folds.
- Hover text on touch screens — a tap follows the link.

## Notes

**Files**

| File | Change |
| :--- | :--- |
| `.ai/backlog/INDEX.md` | `## Reading a Ticket`; Status and Priority bullets point to it |
| `docs/config.js` | `tickets: { file, guide, folded }` |
| `docs/ticket-view.js` | New: facts, part hints, progress, folds |
| `docs/file-view.js` | A ticket file goes through `ticket-view.js` |
| `docs/dom.js` | `markMissingRefs` → `resolveRefs`, which also sets hover titles |
| `docs/sections.js` | "Read the ticket →" on board and archive cards |
| `docs/docs.css` | Facts, hints, progress, folds |

**As built**

- A folded part keeps its hint in the summary, so a closed `Notes` still says what it holds.
- Hover text is the card's title, or its first paragraph when it has none (`I-2`).

**Verified** (headless Chrome over CDP) — 26 checks pass; TASK-022's 22 and TASK-023's
29 still pass.

| AC | How | Result |
| :--- | :--- | :--- |
| 1 | `INDEX.md` | Table under `## Reading a Ticket`; Conventions points to it |
| 2 | TASK-021, TASK-022, archived TASK-011 | 5 facts, each with its text; Status border planned blue, in-progress yellow, done green, as on the board |
| 3 | TASK-021 | Goal, Acceptance Criteria, Out of Scope show their text |
| 4 | TASK-021, TASK-019, TASK-022 | `0 of 4` · 0 %, `9 of 10` · 90 %, `10 of 10` · 100 % |
| 5 | TASK-021 | Notes is a closed `<details>` with its hint; a click opens it |
| 6 | Hover titles | `V-3` → "Low friction"; `I-2` → its text; `TimeEntry` → its Meaning |
| 7 | Board, Archive | "Read the ticket →" to `#file/…`; 5 archive cards linked, TASK-001 (no file) not |
| 8 | Copy with the heading renamed | Ticket renders, warning shown, no hints |
| 9 | `eslint`, `prettier --check docs/*.js docs/docs.css`, `rg -n innerHTML docs` | Pass, pass, no hits |
| — | `context/conventions.md`; 390 px wide | Stays a plain file; no horizontal page scroll |
