# TASK-023 — Docs: open any `.ai/` markdown file rendered

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented; closes once `npm run check` is green (TASK-012) |
| **Priority** | P2 |
| **Value driver** | `V-4` |
| **Depends on** | `TASK-018` |
| **Created** | 2026-11-07 |

## Goal

A ticket card's file link, a section's source link and a link between tickets open
the raw `.md`: unstyled text, and `—` shows as `â€"` because the static server sends
no charset. They open the file rendered on the docs page instead — headings, tables,
code, checkboxes, styled like the rest of the site — so a ticket reads as a page.

## Ontology Touchpoints

**Concepts:** none — documentation tooling.
**Invariants that must hold:** `I-8` in spirit — file text reaches the DOM as text.
**New concepts:** none.

## Acceptance Criteria

- [x] AC-1 — `#file/<path>` renders `.ai/<path>` whole: its `#` heading is the title,
      the rest as blocks. `—` shows as `—`.
- [x] AC-2 — Every link to a `.md` file under `.ai/` opens it there: ticket card
      footers, section sources, links inside rendered text.
- [x] AC-3 — A link to a heading in the same or another file (`[Steps](#steps)`)
      scrolls to it; `#file/<path>#<heading>` survives a reload.
- [x] AC-4 — `- [ ]` / `- [x]` items show as unticked / ticked boxes that cannot be clicked.
- [x] AC-5 — Refs and concept names inside the file link to their cards, as elsewhere.
- [x] AC-6 — The view's source link opens the raw file; a path outside `.ai/` or not
      ending in `.md`, or a file that does not load, shows an error in the view.
- [x] AC-7 — Back and forward move between the file and the section it was opened from.
- [x] AC-8 — No new dependency; `rg -n innerHTML docs` still hits only clearing;
      `docs/*.js` passes `eslint` and `prettier --check`.
- [x] AC-9 — ADR-015 in [`architecture.md`](../context/architecture.md).

## Out of Scope

- Styling a raw `.md` opened by its own URL — a static server sends it as text; no
  page code runs.
- `.md` files outside `.ai/` (`README.md`, `backend/specs/`) — links to them stay raw.
- Markdown beyond what `md-blocks.js` reads — ADR-010's limit stands.

## Notes

**Files**

| File | Change |
| :--- | :--- |
| `docs/file-view.js` | New: the `#file/` view |
| `docs/main.js` | Route `#file/…` to the view |
| `docs/dom.js` | `viewHref`; `.md` links through it; heading slugs; task-list items |
| `docs/docs.css` | File view prose, tone per folder |
| `.ai/context/architecture.md` | ADR-015 |

**Traps**

- `linkConcepts` has to take its names from the whole page: the view renders after the
  sections, and holds no concept cards itself.
- Heading slugs must not become element ids — `## Architecture` would shadow the
  `#architecture` section.
- Every view navigation reuses the `load` cache, so the file is the version read
  on page load; reload to see an edit, as everywhere else on the page.

**As built**

- A list turns into boxes only when every item is `[ ]` or `[x]`; one that mixes them with
  plain items stays text.
- The Definition of Done on the Conventions page keeps its clickable boxes.

**Verified** (headless Chrome over CDP, at `/docs/` and at `/todo/docs/` as on the
JetBrains server) — 29 checks pass at each; TASK-022's 22 still pass.

| AC | How | Result |
| :--- | :--- | :--- |
| 1 | Click TASK-021's card link | View alone; title `TASK-021 — Implement…`; no `â€`; 7 `h3`, 104 code blocks, 6 tables |
| 2 | Hrefs on the loaded page | Card footers, section sources and text links are `#file/…`; no other link to a raw `.ai/` `.md` |
| 3 | Click `Steps`; load `…#step-1--page-shell-and-styles` | Heading 64 px from top both times |
| 4 | TASK-021, TASK-022, TASK-019 | All `[ ]` unticked, all `[x]` ticked, mixed list matches; every box disabled |
| 5 | TASK-021, TASK-019 | 0 missing refs; `SelectedTask` links, click opens Entities |
| 6 | Source link; `#file/../backend/package.json`; `#file/backlog/NOPE.md` | Raw URL; "Not a .md file under .ai/"; 404 shown |
| 7 | Back, then forward | `#backlog` shown, then the file again |
| 8 | `eslint`, `prettier --check docs/*.js docs/docs.css`, `rg -n innerHTML docs` | Pass, pass, no hits |
| — | 390 px wide | No horizontal page scroll |
