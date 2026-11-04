# TASK-019 — Site map on the docs page

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented; closes once TASK-012 makes `npm run check` green |
| **Priority** | P3 |
| **Value driver** | `V-4` |
| **Depends on** | `TASK-018` |
| **Created** | 2026-11-03 |

## Goal

Nothing shows how the site's pages connect: the app's moves between pages are
`window.location.href` calls spread across `src/`, and no page links to `docs/`.
A new docs section shows every page as a tree — what it is for and where it
leads — so a reader sees the whole site and opens any page from one place.

## Ontology Touchpoints

**Concepts:** `SelectedTask` — `show.html` and `edit.html` need one.
**Invariants that must hold:** `I-8` in spirit — file text reaches the DOM as text.
**New concepts:** none — documentation tooling, not the app domain.

## Acceptance Criteria

- [x] AC-1 — `#sitemap` shows the tree. It is the last nav item, so `/docs/`
      still opens Value (TASK-018 AC-1).
- [x] AC-2 — [`architecture.md`](../context/architecture.md) has a `## Site Map`
      table with one row per HTML page (draft in Notes). No app page is typed
      into `docs/`: editing a row and reloading changes the tree (TASK-017 AC-2).
- [x] AC-3 — `docs/index.html` has one child per `DOCS.sections` entry, each
      linking to `#<id>`. A section added to `config.js` appears with no other edit.
- [ ] AC-4 — Every page name opens that page, both from `python3 -m http.server`
      and the JetBrains server (`:63342`, where the site is not at `/`).
      *`http.server` passes; the JetBrains server itself is not yet run — see Notes.*
- [x] AC-5 — Each page shows its purpose and where it goes; `show.html` and
      `edit.html` say they need a `SelectedTask`.
- [x] AC-6 — A bad row stays visible: a page file that does not load, or a
      `Parent` no row names, shows a warning on that item, placed at the top level.
- [x] AC-7 — The whole tree shows at once: no pager, no search box.
- [x] AC-8 — No new dependency; `rg -n innerHTML docs` still hits only clearing;
      `docs/*.js` passes `eslint` and `prettier --check`.
- [x] AC-9 — ADR-012 in [`architecture.md`](../context/architecture.md): table vs
      reading links out of `src/`, with its cost.
- [x] AC-10 — [`conventions.md`](../context/conventions.md) says adding or
      removing a page updates `## Site Map`.

## Out of Scope

- `sitemap.xml` — for search engines; the app is not deployed (VALUE.md §7).
- A drawn graph of page moves — excluded in TASK-017; the `Goes to` text carries it.
- Tickets, cards and API routes in the tree — their sections already list them.
- A link from the app's pages to `docs/` — its own ticket if wanted.
- `edit.html` with no `SelectedTask` — belongs to Q-3.

## Notes

**Draft table.** `Parent` follows the breadcrumbs (`Home / …`); `Goes to` is
traced from `src/render.js:25`, `src/actions.js:21`, `src/action-button.js:27,32`,
`src/add.js:12`, `src/edit.js:21` and `index.html:14`.

| Page | Parent | Purpose | Goes to |
| :--- | :--- | :--- | :--- |
| [`index.html`](../../index.html) | — | Task list: add, start / pause, done, delete | `add.html`, `show.html`, `edit.html` |
| [`add.html`](../../add.html) | `index.html` | New Task form | `index.html` |
| [`show.html`](../../show.html) | `index.html` | One Task's details; needs a `SelectedTask` | `edit.html`, `index.html` |
| [`edit.html`](../../edit.html) | `index.html` | Change a Task; needs a `SelectedTask` | `index.html` |
| [`docs/index.html`](../../docs/index.html) | — | Renders `.ai/` | — |

**Files**

| File | Change |
| :--- | :--- |
| `docs/config.js` | Section `{ id: 'sitemap', kind: 'sitemap', file: 'context/architecture.md', … }` |
| `docs/sections.js` | `sitemap` renderer, in `RENDERERS` |
| `docs/docs.css` | Tree styles; tone falls back to the accent |
| `.ai/context/architecture.md` | `## Site Map`, ADR-012 |
| `.ai/context/conventions.md` | AC-10 line under Frontend |

**Traps**

- Render an own `<ul>`, not `part()` + `tableNode()`: `browse.js` pages a table
  directly under a part, which breaks AC-7.
- Check a page with `load(link.href, doc.url)` in `try/catch`, as `readTicket`
  does. The `Read N files` status then counts the HTML pages too.
- Without a `SelectedTask`, `show.html` renders empty and `edit.html` opens an
  empty form whose Save calls `updateTask(null, …)` — hence the AC-5 wording.
- Cost of the table: a removed page is flagged (AC-6), an added page with no row
  is not; only AC-10 covers that.

**As built**

- AC-6 read literally: every bad row goes to the top level, whatever the cause. A
  row with no link and a `Parent` loop count as bad too — a loop would otherwise
  never be drawn.
- `Goes to` names stay text, as in the draft; only a page's own name links.
- Beyond the file table: `docs/dom.js` exports `refLink`; `context/INDEX.md` names
  the site map.

**Verified** (headless Chrome, a scratch copy for anything edited)

| AC | How | Result |
| :--- | :--- | :--- |
| 1, 7 | `/docs/#sitemap`, `/docs/` | Tree shown, 0 pagers, 0 search boxes; no hash opens Value |
| 2, 3, 5 | Edited a row; added a section to `config.js`; reloaded | Tree changed; new child appeared |
| 4 | Served the parent folder so the site is at `/todo/`; clicked each name | App pages: entry script requested, none in a no-click control. `docs/index.html`: 3 requests against 1 with no click |
| 6 | Rows with a missing file, unknown `Parent`, no link, own parent, loop | Each at the top level with a warning |
| 8 | Row with `<img onerror>` and a `javascript:` link | Literal text; 0 `<img>`, 0 `javascript:` hrefs |

**Not verified:** AC-4 on the JetBrains server itself. `:63342/todo/docs/index.html`
answers 404 here, so `/todo/` above stands in for it. Open the page from the IDE and
click a page name, then tick AC-4.
