# TASK-011 — Timer UI always matches the server

| Field | Value |
| :--- | :--- |
| **Status** | `done` |
| **Priority** | P1 |
| **Value driver** | `V-1` |
| **Depends on** | `TASK-009` |
| **Created** | 2026-10-29 |

## Goal

What the row shows — running or not, and the seconds — is what the server has.
Two paths break this today:

1. **Reload while running.** `createTimer(…, initiallyRunning=true)` sets
   `isRunning` but never starts the interval, so the counter is frozen
   (`src/timer.js`, the `setTimeout` block).
2. **Done while running.** `toggleDoneStatus` calls `stopTimer?.()`, which clears
   the local interval only. The open `TimeEntry` keeps counting, the button still
   says *pause*, and the next click calls `start` → `409`.

## Ontology Touchpoints

**Concepts:** `Timer`, `TimeEntry`, `TrackedTime`, `TaskItem`
**Invariants that must hold:** `I-2`, `I-3`, `I-4`
**New concepts:** none.

## Acceptance Criteria

- [x] AC-1 — T-10 passes: start, wait 5 s, reload → row shows *pause* and keeps counting from the server total.
- [x] AC-2 — Marking a running Task done leaves no state where the button and
      `GET …/timer` `isRunning` disagree; the next click on the timer does not `409`.
- [x] AC-3 — The decision for AC-2 (stop server-side, or keep running) answers
      ontology Q-2 and is recorded as an ADR.

## Out of Scope

- DB-level enforcement of one open entry (Q-1).
- Showing timers on the show page live.

---

## Outcome

**Completed:** 2026-11-05
**What was built:** `tasks.service.updateTask` closes an open entry when `done` is truthy. `createTimer(taskId, seconds, running, render)` draws through a callback, starts ticking when created running, and `sync()` re-reads the server.
**Deviations from the plan:** none. Specs updated: `tasks.service.js.md`, `timer.repository.js.md`.
**Verified how:** T-1…T-8: 15 of 15. Chrome 136 headless over CDP, 10 of 10: T-10 (shown 5 = server 5, then 5 → 7); done while running gives `isRunning: false`, button `start`, tick stopped; next click starts with no `409`; reopen does not resume. `PUT` with `done: true` and a blank title is 400 and leaves the Timer alone.
**Follow-ups raised:** none. The running API was restarted to load the change.
