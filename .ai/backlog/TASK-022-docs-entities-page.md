# TASK-022 — Entities page on the docs site

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — implemented; closes once `npm run check` is green (TASK-012) |
| **Priority** | P2 |
| **Value driver** | `V-4` |
| **Depends on** | `TASK-018` |
| **Created** | 2026-11-07 |

## Goal

The docs site shows the concepts only as one table on the Ontology page, and their
relations, rules and code locations sit in three other places. A new section shows
one card per concept — what it is, where it is stored, where it lives in code, what
it relates to, which rules bind it — and a concept name anywhere on the site opens
its card. A viewer of the project can then walk the model entity by entity.

## Ontology Touchpoints

**Concepts:** all seven — the page shows them, it changes none.
**Invariants that must hold:** `I-8` in spirit — file text reaches the DOM as text.
**New concepts:** none — documentation tooling, not the app domain.

## Acceptance Criteria

- [x] AC-1 — `#entities` sits right after Ontology in the nav and shows one card per
      row of the `Concepts` table in [`ontology.md`](../context/ontology.md), at `#<Concept>`.
- [x] AC-2 — Each card shows `Meaning`, `Persisted`, its `Lives as` cell from
      `## Concept → Code` in [`architecture.md`](../context/architecture.md), its
      relations, and every invariant and open question naming it.
- [x] AC-3 — Relations are read from `## Relations`, both directions: Task's card lists
      `TaskItem represents Task`. The other end links to its card.
- [x] AC-4 — A rule names a concept by its whole word, singular or plural (`TimeEntries`).
      Lowercase prose (`per task`) does not count.
- [x] AC-5 — A `code` or bold span anywhere on the site whose whole text is a concept
      name links to its card; opening it from another section switches to Entities.
- [x] AC-6 — Drift is visible: a concept with no `Concept → Code` row shows a warning on
      its card; a relation to an unknown concept is a missing ref; a `Relations` line
      that does not parse shows a warning under the cards.
- [x] AC-7 — Seven cards show at once: no pager, no search box.
- [x] AC-8 — Editing `ontology.md` or `architecture.md` and reloading changes the cards;
      no concept is typed into `docs/`.
- [x] AC-9 — No new dependency; `rg -n innerHTML docs` still hits only clearing;
      `docs/*.js` passes `eslint` and `prettier --check`.
- [x] AC-10 — ADR-014 in [`architecture.md`](../context/architecture.md).

## Out of Scope

- Table columns from `backend/src/db/migrations/` — the Layers block on the
  Architecture page lists them; parsing SQL is its own ticket if wanted.
- A drawn relation graph — excluded in TASK-017.
- Linking concept names in plain prose — only `code` and bold spans (ADR-014).
- Removing the Concepts table from the Ontology page — it stays as the overview; its
  names now link to the cards.

## Notes

**Files**

| File | Change |
| :--- | :--- |
| `docs/config.js` | `entities` section after `ontology`; per-section `pageSize` |
| `docs/main.js` | `pageSize` override; `linkConcepts` before `markMissingRefs` |
| `docs/sections.js` | `entities` renderer, in `RENDERERS` |
| `docs/dom.js` | `conceptLink`, `linkConcepts` |
| `docs/docs.css` | `--c-entities` tone, relation and rule lists |
| `.ai/context/architecture.md` | ADR-014 |

**Traps**

- `\bTask\b` must not match `TaskItem` or `SelectedTask` — it does not, both sides
  of the name are word characters.
- `linkConcepts` runs after every section renders, or a Value card's `TimeEntry`
  finds no card yet.
- Replace a span with a link holding its clone — `refLink(name, span)` moves the
  span out of the tree before `replaceWith` can use it.

**As built**

- Rules per card on today's files: Task I-1, I-2, I-5, I-6, Q-2 · TimeEntry I-1, I-2,
  I-3, I-5 · Timer I-2, I-3, Q-2 · TrackedTime I-4 · TaskItem I-5 · SelectedTask I-1,
  Q-3 · ApiError I-7.
- Concept names also link on Architecture (Request Flow) and Site map, not only on
  Value, Ontology and Endpoints.

**Verified** (headless Chrome over CDP; a scratch copy for anything edited) — 27 checks pass.

| AC | How | Result |
| :--- | :--- | :--- |
| 1, 7 | `/docs/#entities` | Nav `… Ontology · Entities …`; 7 cards, ids = names; 0 search boxes, pager hidden |
| 2, 3 | Task card | Meaning, Persisted, Lives as; 5 relations, `TaskItem represents Task` among them, ends link to cards |
| 4 | Rules per card, above | `TimeEntries` counts for TimeEntry; Q-1 (`per task`) on no card; Q-3 not on Task |
| 5 | Click `TimeEntry` on a Value card | Hash `#TimeEntry`, only Entities shown, card 64 px from top; no link inside `<pre>` |
| 6, 8 | Copy: Task Meaning edited, row `Widget` added, `Widget --owns--> Gadget`, a junk line | Edit shows; Widget card warns; `#Gadget` marked missing; junk line warned |
| 9 | `eslint docs/*.js`, `prettier --check docs/*.js docs/docs.css`, `rg -n innerHTML docs` | Pass, pass, no hits |
| — | 390 px wide | No horizontal page scroll |

**Not green:** `npm run check` fails on `src/dom-elements.js` and `src/render.js`
(prettier) — uncommitted work outside this ticket.
