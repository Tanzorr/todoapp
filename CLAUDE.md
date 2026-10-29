# Todo Time Tracker — Agent Entry Point

A todo list where every task has its own start/stop timer. Vanilla-JS pages in
the browser, a Node + Express API in `backend/`, MySQL as the only store.

This file routes to the spec-driven layer in [`.ai/`](.ai/README.md). Read the
section you need before acting — not this whole file, and not every context
module.

---

## 0. BE BRIEF

- **Lead with the answer.** Context after it, or not at all.
- **One fact in one place.** If another file states it, link — never restate.
- **Cut any sentence that survives its own deletion.**
- **Tables and lists** wherever the content is a set of items.
- **No preamble, no recap.**
- **Say the trade-off, not the sales pitch.**

Applies to docs, tickets, commit messages, code comments and replies alike.

---

## 1. ONTOLOGY

The domain model lives in [`.ai/context/ontology.md`](.ai/context/ontology.md) —
concepts, relations, invariants I-1…I-10, open questions.

**Concepts:** `Task` · `TimeEntry` · `Timer` · `TrackedTime` · `TaskItem` ·
`SelectedTask` · `ApiError`

- **Names come from the ontology.** It is a `Task`, not a `todo` or `item`, in
  new code. (Legacy names like `deleteTodoItem` stay until a ticket renames them.)
- **A new concept updates `ontology.md`** in the same change.
- **Invariants are not preferences.** Breaking one is a bug.

The one to remember without looking it up:

> **I-2** — A `Task` has at most one open `TimeEntry`. Whether a timer is running
> is *derived* from that row — never stored, and never decided by the browser.

---

## 2. ROUTING

| Mode | File | Use when | Load |
| :--- | :--- | :--- | :--- |
| **implement** | [`.ai/router/implement.md`](.ai/router/implement.md) | Building what a ticket describes | The ticket, [`conventions.md`](.ai/context/conventions.md), [`architecture.md`](.ai/context/architecture.md), [`stack.md`](.ai/context/stack.md), [`testing.md`](.ai/context/testing.md) |
| **review** | [`.ai/router/review.md`](.ai/router/review.md) | Judging a diff before commit | The diff, the ticket, [`conventions.md`](.ai/context/conventions.md), the invariants |

Anything else — a question, a bug hunt, shaping a ticket — needs no mode file.
Read [`.ai/context/INDEX.md`](.ai/context/INDEX.md), then only what the question
needs. A question changes nothing on disk.

---

## 3. WORK TRACKING

- **Planned:** [`.ai/backlog/INDEX.md`](.ai/backlog/INDEX.md)
- **Completed:** [`.ai/archive/INDEX.md`](.ai/archive/INDEX.md)
- **Template:** [`.ai/backlog/TEMPLATE.md`](.ai/backlog/TEMPLATE.md)

Work is done against a ticket. No ticket → write one, or say the request is
outside the backlog. Do not silently expand scope.

A ticket is done when the Definition of Done in
[`conventions.md`](.ai/context/conventions.md) holds in full.

---

## 4. TOOL USAGE

Guidance: [`.ai/context/tools.md`](.ai/context/tools.md). Enforced permissions:
[`.claude/settings.json`](.claude/settings.json).

**Verify** — run the check, don't reason about it:

```bash
npm run check                          # eslint + prettier, frontend
node --check backend/src/<file>.js     # backend syntax
curl -s localhost:3000/health          # API up
```

**Hard rules**

1. Never read `.env` / `backend/.env` — use `backend/.env.example`.
2. Never run `DROP`/`TRUNCATE`, `rm -rf` or `git push --force` unless asked.
3. Never commit or push unless asked.
4. Never add a dependency without raising it first.
5. Never write outside the project root.
6. Report what actually happened — failing output pasted, skipped steps stated.

---

## 5. CURRENT STATE

- Backend M1–M4 work; frontend M5 (API client) is **uncommitted** on
  `prettify-show` — [TASK-009](.ai/backlog/TASK-009-frontend-api-client.md).
- `npm run check` **fails** today (top-level `await` vs `ecmaVersion: 2020`, plus
  3 unformatted files) — [TASK-012](.ai/backlog/TASK-012-green-check.md).
- `backend/src/modules/tasks/` is **not in git** (`.gitignore` matches `tasks/`) —
  [TASK-010](.ai/backlog/TASK-010-track-tasks-module.md), P0.
- Local `tasks/` (gitignored) holds the pre-`.ai/` specs; superseded by `.ai/`.
