# Ontology — Todo Time Tracker

The domain model. Says what exists and how it relates; where it lives in code is
[`architecture.md`](architecture.md).

## 1. Concepts

| Concept | Persisted | Meaning |
| :--- | :--- | :--- |
| **Task** | `tasks` table | A unit of work: `title`, optional `description`, `done` flag. |
| **TimeEntry** | `time_entries` table | One start→stop interval of work on one Task. *Open* while `stoppedAt` is null. |
| **Timer** | no — derived | The running/stopped state of a Task. Running ⇔ the Task has an open TimeEntry. |
| **TrackedTime** | no — derived | Total seconds across a Task's TimeEntries, open one counted up to now. |
| **TaskItem** | no — DOM | The row representing one Task on the list page, carrying its local ticking display. |
| **SelectedTask** | `localStorage.taskId` | Which Task the show/edit page is about. Navigation state only. |
| **ApiError** | no — wire | `{ error: { status, message, field? } }` — every non-2xx API response. |

## 2. Relations

```
Task        --hasTimeEntry-->     TimeEntry     (1 : n, cascade on delete)
Task        --hasTimer-->         Timer         (derived from open TimeEntry)
Task        --hasTrackedTime-->   TrackedTime   (derived: SUM over TimeEntry)
TaskItem    --represents-->       Task          (list page only)
SelectedTask--refersTo-->         Task          (show / edit pages)
```

## 3. Invariants

| # | Invariant |
| :--- | :--- |
| **I-1** | MySQL is the only store of Tasks and TimeEntries. The browser persists nothing but SelectedTask. |
| **I-2** | A Task has at most one open TimeEntry. Starting a running Timer is `409`; stopping a stopped one is `409`. |
| **I-3** | Timer state is derived from TimeEntry rows — never a column on `tasks`, never trusted from the browser. The UI shows what the API reports. |
| **I-4** | TrackedTime is computed by the server. The browser's per-second tick is display only and is replaced by the server total on stop and on load. |
| **I-5** | Deleting a Task deletes its TimeEntries (FK `ON DELETE CASCADE`), and its TaskItem stops ticking before the node is removed. |
| **I-6** | A Task title is non-empty after trim and ≤ 200 chars. The server check is authoritative; the client check is a courtesy. |
| **I-7** | Every API error is an ApiError. Every browser→API call goes through `src/api-client.js`. |
| **I-8** | User text (`title`, `description`) reaches the DOM via `textContent` only, never `innerHTML`. |
| **I-9** | Credentials live in `backend/.env`, which is never committed and never read by the agent. *Currently violated — TASK-013.* |
| **I-10** | SQL lives only in `*.repository.js` and always uses `?` placeholders — no string-built values. |

## 4. Open Questions

- **Q-1** — Should I-2 be enforced by the database (unique open entry per task)?
  Today it is a read-then-insert in `timer.service.js`, so two fast clicks can race.
- **Q-2** — Should marking a Task `done` stop its Timer server-side? Today the UI
  stops the local tick only; the open TimeEntry keeps counting (TASK-011).
- **Q-3** — SelectedTask in `localStorage` vs `?id=` in the URL. The URL version
  is bookmarkable and works per tab.
