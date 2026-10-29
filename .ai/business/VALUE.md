# Business Value — Todo Time Tracker

The document that answers *why this exists*. Every ticket in
[`../backlog/`](../backlog/INDEX.md) must trace to a value driver here. A ticket
that traces to none is either mis-scoped or should be dropped.

---

## 1. The Problem

People keep two separate records of their work, and both are incomplete:

- **A todo list** says *what* is left and *what* is finished — but nothing about
  how long anything took.
- **A time tracker** says *how long* — but lives in another app, so starting and
  stopping it is a separate chore that gets forgotten.

The result is the same in both cases: at the end of the day nobody can answer
"where did my time go?" with numbers they trust. Estimates for the next similar
task are guesses, because the last one was never measured.

The second problem is **fragility**. A list kept in a browser tab or in memory is
gone on reload; a timer that only runs in the page stops counting when the tab
closes. A record that can silently vanish is not a record.

## 2. The Proposition

**A todo list where tracking time is one click on the task itself, and the record
belongs to the server, not to the browser tab.**

Two properties make this worth building rather than using a plain list:

1. **Tracking lives on the task.** No second app, no copying names between tools.
   Start, pause and done sit in the same row as the title.
2. **The number is real.** Every start and stop is a row in MySQL (`TimeEntry`).
   The total is computed from those rows, so reloading, closing the tab or opening
   a second tab shows the same time — and the browser cannot invent or lose any.

A third, quieter property: **the code is meant to be read.** This is also a
learning project. Vanilla JS with no build step, one job per file, and written
specs mean a beginner can follow a click from the button to the SQL.

## 3. Stakeholders

| Stakeholder | What they need | How the system serves it |
| :--- | :--- | :--- |
| **User** (tracks their work) | Capture tasks fast; know how long each one really took | List page with add / start / pause / done / delete per row; server-computed totals |
| **Developer / learner** (reads and changes the code) | Understand the whole flow without frameworks or tooling | Vanilla ES modules, layered backend, `backend/specs/`, this `.ai/` layer |
| **Future re-implementer** (ports the backend) | A contract precise enough to rebuild from | API surface in `architecture.md`, per-file specs, consistent error envelope |
| **AI agent** (works in the repo) | Correct names, rules and boundaries without re-deriving them | `CLAUDE.md` → `.ai/` context, enforced permissions |

## 4. Value Drivers

| ID | Driver | Why it matters | Realised by |
| :--- | :--- | :--- | :--- |
| **V-1** | Trustworthy tracked time | The only reason to track time is to use the number — for estimates, reports, or just honesty with yourself. A number the UI can drift from is worse than none, because it looks real. | `TimeEntry`, `TrackedTime` computed server-side (I-2, I-3, I-4) |
| **V-2** | Nothing lost | A list that resets on reload is used once. Persistence is the difference between a demo and a tool. | MySQL as the only store (I-1); FK cascade keeps it clean (I-5) |
| **V-3** | Low friction | If tracking takes more effort than the work is worth, people stop tracking — and V-1 is never realised. | One-click controls per row, floating action button, short add form |
| **V-4** | Learnable codebase | The project teaches how a browser app, an API and a database fit together. Hidden magic (frameworks, bundlers) would defeat that. | ADR-003: vanilla JS, no build; one responsibility per file |
| **V-5** | Re-implementable, shareable backend | A written contract lets the backend be ported, reviewed, or handed over without reverse-engineering it. | `backend/specs/`, API conventions (ADR-007, ADR-008), code actually in git |

## 5. Requirements Traced to Value

So no feature exists without a reason, and no reason goes unbuilt.

| Requirement | Value driver | Ontology concepts |
| :--- | :--- | :--- |
| Add a task with title and optional description | V-3 | `Task` |
| See all tasks in a list | V-3 | `Task`, `TaskItem` |
| Open one task's details (title, time, status, description) | V-1 | `Task`, `TrackedTime`, `SelectedTask` |
| Edit title and description | V-3 | `Task` |
| Mark a task done | V-3 | `Task.done` |
| Delete a task, and its time with it | V-2 | `Task`, `TimeEntry` (cascade) |
| Start / pause a timer per task | **V-1**, V-3 | `Timer`, `TimeEntry` |
| Only one running timer per task | **V-1** | Invariant **I-2** |
| Time and tasks survive reload and new tabs | **V-2** | Invariant **I-1** |
| Total time computed by the server, not the browser | **V-1** | Invariant **I-4** |
| Runs from static files, no build | V-4 | ADR-003 |
| Errors have one shape the UI can show | V-3, V-5 | `ApiError`, I-7 |

The two rows that matter most are **I-2** and **I-4**. Together they make the
tracked time a fact stored in the database rather than a counter running in a
tab — which is the whole point of V-1.

## 6. Success Criteria

Observable statements, checkable against a running system:

- **S-1** — Start → wait N s → stop → reload shows N ± 1 s.
- **S-2** — Reload while a timer runs: the task still shows as running and keeps
  counting. *(Fails today — TASK-011.)*
- **S-3** — Every page works served as static files, with no build step.
- **S-4** — Deleting a task leaves no orphan `time_entries` rows.
- **S-5** — `git grep` finds no live credential in the repository. *(Fails today — TASK-013.)*
- **S-6** — A fresh clone plus the steps in `stack.md` gives a working app.
  *(Fails today — TASK-010.)*

## 7. Non-Goals

Named explicitly so scope cannot creep in through the back door:

- **Not** multi-user. No accounts, login or per-user isolation — adding them
  changes the ontology (every `Task` gains an owner) and needs its own ADR.
- **Not** real-time. No WebSockets or SSE; a second tab sees changes on reload.
- **Not** a framework app. No React/Vue, bundler or TypeScript — that would
  undo V-4.
- **Not** a reporting tool. No charts, exports or invoices; the data is there
  for one to be built later as its own ticket.
- **Not** deployed. No Docker or CI pipeline; it runs on a developer machine.

## 8. Key Risks

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| UI and server disagree on whether a timer runs | Wrong time recorded, `409` on the next click — V-1 broken quietly | I-2/I-3: the UI derives state from the API (TASK-011) |
| Two fast clicks start two timers | Double-counted time | Service rejects with `409`; a DB-level guard is open question Q-1 |
| Code missing from git (`.gitignore` too broad) | A clone does not start — V-2, V-5 lost | TASK-010 |
| Credentials committed | Database password leaks | I-9, TASK-013 |
| No automated tests | Regressions found by hand, late | Manual checks in `testing.md`; TASK-014 |
| Docs drift from code | Agents and learners trust wrong facts — V-4, V-5 eroded | Definition of Done requires updating specs, ontology and ADRs in the same change |
