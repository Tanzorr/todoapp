# TASK-020 — Redesign the task pages

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P2 |
| **Value driver** | `V-3`, `V-1` |
| **Depends on** | `TASK-011`, `TASK-015` |
| **Created** | 2026-11-04 |

## Goal

The list shows at a glance what is running and how long each task took, with one
main action per row. Nothing is deleted by accident, failures show without a
blocking dialog, and every page works by keyboard and on a phone.

Design: [canvas](https://claude.ai/artifact/YRJ95jeQUeEUrLF959Gr8J) (private),
boards `A — Ledger`, `A — Phone`, `A — Task`, `A — Form`, `A — States`.

Execution plan: [TASK-021](TASK-021-implement-task-pages-redesign.md).

## Ontology Touchpoints

**Concepts:** `Task`, `Timer`, `TrackedTime`, `TaskItem`, `ApiError`
**Invariants that must hold:** `I-2`, `I-3`, `I-4`, `I-5`, `I-6`, `I-7`, `I-8`
**New concepts:** none.

## Acceptance Criteria

- [ ] AC-1 — A list row reads: done checkbox, title link, time, Start/Stop, edit, delete. Edit and delete are icons with an `aria-label`.
- [ ] AC-2 — Time reads `HH:MM:SS` on list and show. `Total` under the list is the sum of the rows and ticks with them (display only, I-4).
- [ ] AC-3 — A running row is tinted, its time sits on a gold chip with a dot, and the header shows `N running`. Gold marks nothing else.
- [ ] AC-4 — A done row has a checked box, a muted struck title and no Start; unchecking restores it. Marking a running Task done leaves `GET …/timer` at `isRunning: false`.
- [ ] AC-5 — Delete asks inline (`Delete task and its time?`, Cancel / Delete) on the row and on show. Cancel changes nothing. T-7 and T-11 pass.
- [ ] AC-6 — A control is disabled with a spinner while its request is in flight. Double-clicking Start sends one request and no `409`.
- [ ] AC-7 — A failed action shows a dismissible inline `role="alert"` message, not `alert()`. The row keeps the state the API reports (I-3).
- [ ] AC-8 — The list has a loading skeleton, a server-unreachable state with Retry, and an empty state with New task.
- [ ] AC-9 — The list has one New task link. `.page-action-btn` and `src/action-button.js` are gone.
- [ ] AC-10 — Show has a back link, title, running/done chip, tracked time ticking while running, Start/Stop, description, Mark done/Reopen, Edit and Delete.
- [ ] AC-11 — Add and edit share one form: visible labels, an `N / max` counter (max from TASK-015), the error in `.error-container`, focus on the invalid field, one submit button, Cancel. Enter submits.
- [ ] AC-12 — Every control is a real `<button>` or `<a>` reachable by Tab with a visible focus ring. Targets are ≥ 44 px, text contrast ≥ 4.5:1, animation is off under `prefers-reduced-motion`.
- [ ] AC-13 — Every page has `<!doctype html>`, `lang="en"`, a viewport meta and its own `<title>`. No horizontal scroll at 360 px.
- [ ] AC-14 — System fonts only: no font files, no third-party requests in the Network tab.
- [ ] AC-15 — T-9, T-10 and T-12 pass.

## Out of Scope

- Undo for delete: needs soft delete, an API and schema change.
- Time entry history on show: no endpoint.
- Sorting, filtering, dark theme.

## Notes

| Decision | Choice | Trade-off | Recorded in |
| :--- | :--- | :--- | :--- |
| Direction | A: dense rows, one time column | Running timer less striking than a full-card highlight | here |
| Fonts | System stacks, no dependency | Looks slightly different per OS | here |
| Done while running | Stops the Timer server-side | Reopening does not resume it | TASK-011 AC-3 must decide this way, ontology Q-2 |
| Delete | Inline confirm | One extra click | here |
| Errors | Inline message | More DOM code than `alert()` | New ADR superseding the `alert()` half of ADR-005; `conventions.md` updated |
| Button label | `Stop`, not `pause` | Wording changes in docs | `BUTTON_TEXT`, `VALUE.md` |
| Floating button | Removed | One more scroll on a very long list | `VALUE.md` V-3 |
