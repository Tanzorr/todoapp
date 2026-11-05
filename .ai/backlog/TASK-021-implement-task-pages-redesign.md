# TASK-021 — Implement the task-pages redesign

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P2 |
| **Value driver** | `V-3`, `V-1` |
| **Depends on** | `TASK-011`, `TASK-012`, `TASK-015` |
| **Created** | 2026-11-05 |

## Goal

The user gets the redesigned list, show, add and edit pages.
[TASK-020](TASK-020-redesign-task-pages.md) says what they must do; this ticket
says in what order to build them and how to prove each part. Both close together.

## Ontology Touchpoints

**Concepts, invariants:** as in TASK-020.
**New concepts:** none.

## Acceptance Criteria

- [ ] AC-1 — Every AC in TASK-020 is ticked, and the Outcome gives the result of its check from [Steps](#steps).
- [ ] AC-2 — `grep -rnE 'alert\(|action-button|page-action-btn|breadcrumbs|BUTTON_TEXT\.pause' src *.html style.css` finds nothing.
- [ ] AC-3 — `grep -nE 'alert\(|pause|floating|breadcrumbs|action-button' .ai/context/conventions.md .ai/context/architecture.md .ai/business/VALUE.md` hits only ADR records.
- [ ] AC-4 — Every decision in [Notes](#notes) holds in the code, or the Outcome states the deviation and why.

## Before Starting

| Check | If it fails |
| :--- | :--- |
| TASK-011, TASK-012, TASK-015 are archived | Do them first |
| The TASK-011 ADR chooses the server-side stop | Stop: TASK-020 assumes it, so the ticket is wrong |
| `npm run check` exits 0 | TASK-012 is not really done |
| `MAX_TASK_LENGTH` agrees with I-6 | TASK-015 is not really done |

Those tickets change `src/timer.js` and `src/validations.js`, so read both again
first. This plan names functions, not lines.

## Steps

Go in order. Each step is one logical change and leaves all four pages working.
Browser checks are by hand, in a stated browser
([`testing.md`](../context/testing.md)).

| Step | What | TASK-020 |
| :--- | :--- | :--- |
| 1 | Page shell and styles | AC-13, AC-14, part of AC-12 |
| 2 | Shared helpers | Groundwork |
| 3 | List row | AC-1, AC-2, AC-3, AC-4, AC-6, AC-7 |
| 4 | Delete on the row | AC-5 (row) |
| 5 | List states | AC-8, AC-9 (list) |
| 6 | Show page | AC-10, AC-5 (show) |
| 7 | Shared form | AC-11, AC-9 (rest) |
| 8 | Docs | Notes of TASK-020 |
| 9 | Final pass and close-out | AC-12, AC-13, AC-15 |

### Step 1 — Page shell and styles

**Do**

- On all four pages: `<!doctype html>`, `lang="en"`, charset, viewport, own `<title>`.
- Remove the comment above the doctype in `add.html`.
- Build the header and footer from the boards. `My todo` links to `index.html`.
- Remove the breadcrumbs.
- In `style.css`: colour tokens on `:root`, system fonts, button classes, focus ring, 44 px targets, reduced-motion rule.
- Keep `.page-action-btn` for now; step 7 removes it.

**Files:** `index.html`, `add.html`, `edit.html`, `show.html`, `style.css`

**Check**

- [ ] The Network tab shows requests to `localhost` only.
- [ ] `grep -E '@font-face|@import|https?:' style.css` finds nothing.

### Step 2 — Shared helpers

**Do**

- Add `formatTime(seconds)` to `src/timer.js`. It returns `HH:MM:SS`.
- Add `src/feedback.js` with `setBusy(button, busy)` and a dismissible inline error (`role="alert"`, text through `textContent`).
- In `apiFetch`, keep `.field` from the ApiError and turn a failed `fetch` into a readable message.
- In `BUTTON_TEXT`, replace `pause` with `Stop`.

**Files:** `src/timer.js`, `src/feedback.js` (new), `src/api-client.js`, `src/constants.js`, `src/dom-elements.js`

**Check**

- [ ] T-4, T-5, T-6 pass (required when `api-client.js` changes).

### Step 3 — List row

**Do**

- Build the row in AC-1's order. Edit and delete are inline SVG icons.
- Add the tint and gold chip for a running row.
- Add `N running` and `Total`. Recompute both from the rows after each tick and action.
- Run Start, Stop and done through `setBusy`. A failure shows the inline error under the row.
- Stop the tick only after the server confirms. After a failed timer action, read `GET …/timer` again and show that.
- Add an ADR superseding the `alert()` half of ADR-005, and update the rule in `conventions.md`.

**Files:** `src/dom-elements.js`, `src/render.js`, `src/actions.js`, `src/timer.js`, `style.css`, `architecture.md`, `conventions.md`

**Check**

- [ ] Network set to Slow 3G, double-click Start: one `POST …/start`, no `409`.
- [ ] DevTools blocks `*/timer/stop`, click Stop: the message shows and the row keeps ticking.
- [ ] Mark a running Task done: `GET …/timer` gives `isRunning: false`.
- [ ] The gold token appears only in running-state selectors in `style.css`.
- [ ] T-4, T-5, T-6, T-10, T-12 pass.

### Step 4 — Delete on the row

**Do**

- Replace the row's controls with `Delete task and its time?`, Cancel, Delete.
- Move focus to Cancel on open, and back to the delete icon on Cancel.
- In `deleteTodoItem`, stop the tick after `DELETE` succeeds, just before removing the node (I-5).

**Files:** `src/actions.js`, `src/dom-elements.js`, `style.css`

**Check**

- [ ] Cancel changes nothing.
- [ ] DevTools blocks `DELETE`, confirm: the message shows, the row stays and keeps ticking.
- [ ] T-7, T-11 pass.

### Step 5 — List states

**Do**

- Add the loading skeleton with `aria-busy`.
- Add `Can't load tasks` with Retry.
- Add `No tasks yet` with New task.
- Leave one New task link. Under 600 px, pin it to a bottom bar, with padding so it never covers the last row.
- Remove the floating button from `index.html` and `initPageAction()` from `src/index.js`.

**Files:** `src/render.js`, `src/index.js`, `index.html`, `style.css`

**Check**

- [ ] Network set to Slow 3G: the skeleton shows.
- [ ] Stop the API, reload: the error shows. Start it, Retry: the list shows.
- [ ] No tasks: the empty state shows.
- [ ] `document.querySelectorAll('a[href*="add.html"]').length` is 1 in each state.

### Step 6 — Show page

**Do**

- Build the page from `A — Task`: back link, title, chip, time, Start/Stop, description, Mark done/Reopen, Edit, Delete.
- Tick the time through `createTimer`.
- Reuse step 4's delete; after it, go to `index.html`.
- Show the inline error and back link if the page cannot load.
- Remove the floating button from `show.html` and `initPageAction()` from `src/show.js`.

**Files:** `show.html`, `src/show.js`, `src/dom-elements.js`, `style.css`

**Check**

- [ ] Start, reload: the time keeps counting.
- [ ] Mark a running Task done: it stops. Reopen: it does not resume.
- [ ] Delete the Task in another tab, reload: the message and back link show.

### Step 7 — Shared form

**Do**

- Build the form in `src/task-form.js`. `src/add.js` and `src/edit.js` only wire it.
- Make `validations.js` find `.error-container` when called, not at import.
- Delete `src/action-button.js` and `.page-action-btn`.
- Delete the `form`, `title`, `description` exports of `dom-elements.js`.

**Files:** `add.html`, `edit.html`, `src/task-form.js` (new), `src/add.js`, `src/edit.js`, `src/validations.js`, `src/dom-elements.js`, `style.css`

**Check**

- [ ] Blank title: the error shows in `.error-container` and focus is on the title.
- [ ] Enter submits.
- [ ] Stop the API, submit: the message shows in `.error-container` and submit is enabled again.
- [ ] T-2, T-9, T-12 pass.

### Step 8 — Docs

**Do**

- `architecture.md`: Layers, the `TaskItem` row, Site Map purposes, "`Parent` follows the back link". Keep the column names; `docs/config.js` reads them.
- `conventions.md`: where `feedback.js` and `task-form.js` sit.
- `VALUE.md`: `pause` becomes `stop`; the floating button leaves V-3.

**Files:** `architecture.md`, `conventions.md`, `VALUE.md`

**Check**

- [ ] AC-3 above holds.
- [ ] `docs/index.html#sitemap` renders with no warning.

### Step 9 — Final pass and close-out

**Do**

- Tab through all four pages.
- View them at 360 px, and with reduced motion emulated.
- Fill the Outcome of both tickets, archive both, update both indexes.

**Files:** both tickets, both indexes

**Check**

- [ ] The focus ring is visible on every control, the header link included.
- [ ] `document.documentElement.scrollWidth` is at most 360.
- [ ] With reduced motion, the dot and spinner do not animate.
- [ ] `npm run check` and T-1…T-12 pass, results pasted in the Outcome.

## Out of Scope

- What TASK-020 lists there.
- Backend changes: the server-side stop belongs to TASK-011.
- Renaming legacy names (`addTodo`, `deleteTodoItem`).
- `docs/index.html`: AC-12, AC-13 and AC-14 are read as the four task pages.
- Browser test tooling: it is a new dependency, raise it first.

## Notes

**Boards** are in the canvas linked from TASK-020, at `project/<file>`:

| Board | File |
| :--- | :--- |
| `A — Ledger` | `Main.dc.html` |
| `A — Phone` | `Phone.dc.html` |
| `A — Task` | `Show.dc.html` |
| `A — Form` | `Form.dc.html` |
| `A — States` | `States.dc.html` |

`B — Stopwatch` and `C — Focus` are rejected directions. Do not copy two mock-up
leftovers: the stray `Your text here` in `Main.dc.html`, and Delete on show drawn
as an `<a>`, which must be a `<button>`.

**Contrast** of the text colours on the boards was computed on 2026-11-05: the
lowest is 5.36:1 (done title on white). Only colours added later need a check.

**Decisions** where the boards or TASK-020 leave a gap or conflict:

| Decision | Choice | Trade-off | Recorded in |
| :--- | :--- | :--- | :--- |
| Shared form | Built in JS by `src/task-form.js` | Draws only after the module loads, but no duplicated markup; ADR-003 rules out build-time templates | here |
| Done control | `<button aria-pressed>` as on the boards, not `<input type="checkbox">`, which AC-12 would not allow | Box is drawn by hand | here |
| Where an error shows | Under the row that failed; above the actions on show | Row grows, but a banner over a long list would be off-screen on a phone | New ADR, step 3 |
| After save | Redirect to `index.html`; the `Saved` banner on `A — Form` is not built | No explicit confirmation; T-9 and the Site Map stay true | here |
| Empty list | Header link hidden, the empty state holds the only New task | Link moves; AC-8 and AC-9 both hold as written | here |
| Focus ring on the header | White; the boards' `#111` ring is 1:1 on the `#111` header | One extra rule | `style.css` |
| Show or edit cannot load | Inline error and back link, also with no SelectedTask | Goes past TASK-020's ACs and no board draws it; without it the page stays blank once `alert()` goes | here |
| Title and edit as `<a>` | `saveTaskId` on `click` and `auxclick` | "Open in new tab" from the context menu still shows the previous SelectedTask until Q-3 | Q-3 |
| `src/feedback.js` | Leaf module for busy state and inline error | A second file creates DOM; putting them in `dom-elements.js` makes `timer.js` and `actions.js` import cycles | `conventions.md` |
