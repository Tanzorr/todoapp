# TASK-018 — Docs: one page per section, search and pages for long lists

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented; closes once TASK-012 makes `npm run check` green |
| **Priority** | P2 |
| **Value driver** | `V-4`, `V-5` |
| **Depends on** | `TASK-017` |
| **Created** | 2026-10-29 |

## Goal

The docs page from TASK-017 stacks every section into one long scroll. Each
section becomes its own page, and a long list on it can be searched and paged,
so a reader finds one ticket, invariant or ADR without scrolling past the rest.

## Ontology Touchpoints

**Concepts:** none — documentation tooling, not the app domain.
**Invariants that must hold:** `I-8` in spirit — file text reaches the DOM as text.
**New concepts:** none.

## Acceptance Criteria

- [x] AC-1 — One section shows at a time; the nav marks the current one and the
      tab title names it. `#<section-id>` opens that section — old links such as
      `docs/#archive` keep working; no hash opens the first section.
- [x] AC-2 — Back / forward move between sections.
- [x] AC-3 — A reference link (`V-1`, `TASK-009`, `ADR-010`…) opens the section
      holding that card, on the list page holding it, scrolled to it — also when a
      search on that section had hidden it.
- [x] AC-4 — A list with more than `pageSize` items (`docs/config.js`, 6) shows
      that many at a time, with prev / next and page-number buttons. Lists are card
      grids, the endpoint list and a table directly under a part heading.
- [x] AC-5 — A section with more than `pageSize` items has a search box. It
      keeps the items containing every typed word (case-insensitive), pages the
      result, hides groups left empty, and shows `n of total` or `No matches`.
- [x] AC-6 — Search and pages are own code in a file that names no section; no
      new dependency; `rg -n innerHTML docs` still hits only clearing.
- [x] AC-7 — `docs/*.js` passes `eslint` and `prettier --check`.

## Out of Scope

- Search across all sections at once — one box per section.
- Search text or list page kept in the URL or across reloads.
- Separate `.html` file per section — see ADR-011.

## Notes

- Every section is still rendered on load, so `markMissingRefs` keeps seeing
  every card id; switching sections only toggles `hidden`.
