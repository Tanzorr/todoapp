# TASK-017 — One docs page rendered from `.ai/`

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented; closes once TASK-012 makes `npm run check` green |
| **Priority** | P2 |
| **Value driver** | `V-4`, `V-5` |
| **Depends on** | — |
| **Created** | 2026-10-29 |

## Goal

One page in the browser shows the whole `.ai/` layer — why the app exists,
the ontology, open and archived tickets, conventions, endpoints and ADRs — read
from the `.md` files on load, so it cannot drift from them. It replaces the
hand-written `architecture.html`, which already repeats `architecture.md`
(VALUE.md §8, "Docs drift from code").

## Ontology Touchpoints

**Concepts:** none — documentation tooling, not the app domain.
**Invariants that must hold:** `I-8` in spirit — file text reaches the DOM as text.
**New concepts:** none.

## Acceptance Criteria

| Section | Source (under `.ai/`) |
| :--- | :--- |
| Value | `business/VALUE.md` §4 drivers, §6 success criteria |
| Ontology | `context/ontology.md` concepts, invariants, open questions |
| In progress | `backlog/INDEX.md` + each ticket's field table, grouped by status |
| Archive | `archive/INDEX.md`, both tables |
| Conventions | `context/conventions.md`, Definition of Done as a checklist |
| Endpoints | `context/architecture.md` → API Surface, coloured by method |
| Architecture | `context/architecture.md` layers + ADRs |

- [x] AC-1 — `docs/index.html`, served as in [`stack.md`](../context/stack.md),
      shows every section in the table above.
- [x] AC-2 — Nothing shown is typed into `docs/`. Changing a ticket's `Status`
      in its file and reloading moves its card; the ticket file wins over
      `INDEX.md`, as `backlog/INDEX.md` says.
- [x] AC-3 — `V-n`, `I-n`, `S-n`, `TASK-NNN` and `ADR-NNN` render as in-page
      links to their card.
- [x] AC-4 — No new dependency: no npm package, no CDN script. Inline markdown
      (bold, code, links) is handled by own code.
- [x] AC-5 — File text goes in via `textContent` / `createElement`;
      `rg -n innerHTML docs` hits only clearing (`= ''`).
- [x] AC-6 — Extractable later: table parsing sits in `docs/md-table.js` with no
      DOM and no project names; the file → section map is one config object;
      nothing in `docs/` imports from `src/`.
- [x] AC-7 — `architecture.html` content lives in the Architecture section; the
      file is deleted and nothing links to it.
- [x] AC-8 — `docs/*.js` is in the `lint` and `check` scripts and passes them.
- [x] AC-9 — ADR-010 in [`architecture.md`](../context/architecture.md): own
      page vs Docsify, VitePress / Starlight and Backlog.md, with its cost.
- [x] AC-10 — [`.ai/README.md`](../README.md) links the page.

## Out of Scope

- Editing from the page (drag-and-drop, writing back to `.md`) — needs a write
  path; read-only here.
- Publishing as a separate package — its own ticket, once a second project
  wants it or the `.ai/` table formats are unchanged for a month.
- `backend/specs/`, full-text search, a rendered dependency graph.
- Reshaping `.ai/` files to suit the page — the page adapts to the files.

## Notes

- `fetch` does not work from `file://`; the JetBrains server (`:63342`) or the
  static server in `stack.md` both serve the root, so `../.ai/…` resolves.
- Changing a column in `INDEX.md` or `TEMPLATE.md` breaks a section — the
  formats become a contract the page depends on.
