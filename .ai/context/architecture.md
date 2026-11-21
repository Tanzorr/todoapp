# Architecture

Where each ontology concept lives. Per-file contracts:
[`backend/specs/`](../../backend/specs/README.md).

## Layers

```
Browser  (index / add / edit / show .html)
  page entry      src/index.js · add.js · edit.js · show.js     wire a page, nothing else
  rendering       src/render.js                                 list page: fetch → TaskItems
  DOM factories   src/dom-elements.js                           create nodes, no fetch
  handlers        src/actions.js · src/action-button.js         click → API → DOM
  timer display   src/timer.js                                  per-TaskItem tick, start/stop
  API adapter     src/api-client.js                             the only fetch() (I-7)
  config / rules  src/constants.js · src/validations.js · src/data.js
        │  HTTP JSON
        ▼
Node / Express  (backend/src)
  routes  →  controller  →  service  →  repository  →  db/pool.js  →  MySQL
              parse req      rules +      SQL only
              send res       validation   (I-10)
  middleware/  authenticate (Bearer → req.user), rate-limit,
               not-found, error-handler → ApiError (I-7)
  modules/     auth · users · tasks · timer — every tasks/timer query takes userId (I-11)
        │  SQL with ? placeholders (mysql2 pool)
        ▼
MySQL 8  (backend/src/db/migrations/, tracked in schema_migrations — ADR-017)
  users           id · email UNIQUE · password_hash · created_at · updated_at
  refresh_tokens  id · user_id → users.id CASCADE · token_hash UNIQUE · expires_at · revoked_at NULL
  tasks           id · user_id → users.id CASCADE · title VARCHAR(200) · description NULL · done · …
  time_entries    id · task_id → tasks.id ON DELETE CASCADE · started_at · stopped_at NULL = open
```

**Dependencies point down only.** A repository never throws HTTP-shaped errors
for business rules; a controller never contains SQL; `dom-elements.js` never
calls `fetch`.

## Request Flow

Adding a Task, end to end:

1. `add.html` submit → `src/add.js` → `createTask()` in `src/api-client.js` →
   `POST /api/tasks` with `{ title, description }`.
2. `authenticate` checks the Bearer token and sets `req.user` (no token → `401`) →
   `tasks.routes.js` → `tasks.controller.js` reads the body → `tasks.service.js`
   validates the title (I-6) → `tasks.repository.js`.
3. MySQL runs `INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)`
   (I-10, I-11) and returns the new `id`.
4. The controller answers `201` with the `Task`; `add.js` redirects to
   `index.html`, where `src/render.js` fetches the list and draws a TaskItem per Task.

## Concept → Code

| Concept | Lives as |
| :--- | :--- |
| `Task` | `tasks` table · `backend/src/modules/tasks/*` · `rowToTask()` maps to camelCase |
| `TimeEntry` | `time_entries` table · `backend/src/modules/timer/timer.repository.js` |
| `Timer` | `timer.service.js` (`findOpenEntry` ⇒ running) · `GET /api/tasks/:id/timer` → `isRunning` |
| `TrackedTime` | `timer.repository.getTotalSeconds()` (SQL `SUM(TIMESTAMPDIFF…)`) |
| `TaskItem` | `render.addTodo()` + `dom-elements.createControls()`; `.stopTimer` property on the node |
| `SelectedTask` | `src/data.js` (`saveTaskId` / `getTaskId`) |
| `ApiError` | `backend/src/middleware/error-handler.js`; thrown as `Error` with `.status`, `.field`; `code` derived from the status |
| `User` | `users` table · `backend/src/modules/users/users.repository.js` · `req.user` set by `middleware/authenticate.js` |
| `RefreshToken` | `refresh_tokens` table · `backend/src/modules/auth/` (`auth.tokens.js` signs, `auth.repository.js` stores the hash, `auth.cookies.js` carries it) |

## API Surface

| Method | Path | Success |
| :--- | :--- | :--- |
| GET | `/health` | 200 |
| POST | `/api/auth/register` | 201 `User` — body `{ email, password }` · 409 if taken · 429 after 5/min |
| POST | `/api/auth/login` | 200 `{ accessToken, user }` + `refreshToken` cookie · 401 · 429 after 5/min |
| POST | `/api/auth/refresh` | 200 `{ accessToken, user }` + new cookie · 401 |
| POST | `/api/auth/logout` | 204, cookie cleared |
| GET | `/api/auth/me` | 200 `User` (Bearer) |
| GET | `/api/tasks` | 200 `Task[]` — the caller's only |
| GET | `/api/tasks/:id` | 200 `Task` |
| POST | `/api/tasks` | 201 `Task` — body `{ title, description? }` |
| PUT | `/api/tasks/:id` | 200 `Task` — body `{ title?, description?, done? }`; `done: true` stops the Timer (ADR-013) |
| DELETE | `/api/tasks/:id` | 204 |
| GET | `/api/tasks/:id/timer` | 200 `{ taskId, totalSeconds, isRunning }` |
| POST | `/api/tasks/:id/timer/start` | 201 · 409 if running |
| POST | `/api/tasks/:id/timer/stop` | 200 `{ …, elapsedSeconds }` · 409 if stopped |

Every `/api/tasks` route needs `Authorization: Bearer <accessToken>` (ADR-016).
Errors: 400 invalid input, 401 no or bad token, 404 missing task/route or another
User's Task (I-11), 409 timer state or email taken, 429 rate limit, 500 otherwise.

## Site Map

One row per HTML page; the docs page draws it as a tree (ADR-012). `Parent` follows
the breadcrumbs.

| Page | Parent | Purpose | Goes to |
| :--- | :--- | :--- | :--- |
| [`index.html`](../../index.html) | — | Task list: add, start / pause, done, delete | `add.html`, `show.html`, `edit.html` |
| [`add.html`](../../add.html) | `index.html` | New Task form | `index.html` |
| [`show.html`](../../show.html) | `index.html` | One Task's details; needs a `SelectedTask` | `edit.html`, `index.html` |
| [`edit.html`](../../edit.html) | `index.html` | Change a Task; needs a `SelectedTask` | `index.html` |
| [`docs/index.html`](../../docs/index.html) | — | Renders `.ai/` | — |

## ADRs

Decisions made before this file existed are recorded with their original date.

### ADR-001 — Timer state is derived from `time_entries`, not stored
**2026-07-15 · Accepted.** A `is_running` column can disagree with the rows it
summarises; an open row cannot. Cost: one extra query per `GET …/timer`.

### ADR-002 — Raw SQL through `mysql2`, no ORM
**2026-07-15 · Accepted.** Two tables do not earn an ORM, and raw SQL keeps the
backend readable for V-4. Cost: hand-written row mapping in each repository.

### ADR-003 — Vanilla JS, no build step
**2026-04 · Accepted.** The project is a learning codebase (V-4). Cost: no
TypeScript, no tree-shaking; frontend needs a static server for ES modules.

### ADR-004 — CommonJS backend, ES-module frontend
**2026-07-15 · Accepted.** Express/dotenv examples and `require` keep the
backend conventional for Node 20. Cost: two module systems in one repo — code
cannot be shared between them without a copy.

### ADR-005 — One fetch adapter; errors surface as `alert()`
**2026-07-15 · Accepted.** All calls go through `src/api-client.js`, which
throws `Error(error.message)`. `alert` matches the existing UX. Cost: blocking
dialogs; replaced if inline error display is ticketed.

### ADR-006 — Separate add / edit / show pages, not a modal
**2026-06-29 · Accepted** (commit `9668892`), superseding the modal plan
(TASK-003). The reason was not recorded at the time. Cost: SelectedTask must be
carried between pages (`localStorage`, see Q-3).

### ADR-007 — No version prefix; `/api/v2` only on a breaking change
**2026-07-15 · Accepted.** Additive changes (new optional fields, endpoints)
are not breaking.

### ADR-008 — Per-file backend specs; code wins on conflict
**2026-07-16 · Accepted.** `backend/specs/` mirrors `backend/src/` (V-5). When
spec and code disagree, the code is right and the spec is fixed in the same
change. Cost: manual upkeep on every exported-behaviour change.

### ADR-009 — `.ai/` replaces `tasks/` as the work-tracking layer
**2026-10-29 · Accepted.** `tasks/` was gitignored, so specs were not shared or
reviewed. `.ai/` is committed and traceable. Cost: legacy specs summarised, not
copied — originals stay in the local `tasks/` folder until deleted.

### ADR-010 — Docs page is own code reading `.ai/`, not a docs tool
**2026-10-29 · Accepted** (TASK-017). `docs/index.html` fetches the `.ai/` files
on load and renders them as linked cards. Rejected: Docsify — a third-party
script that renders pages, with no board or ID links; VitePress / Starlight — npm
packages and a build step (ADR-003); Backlog.md — its own ticket format and CLI,
so `.ai/` would bend to the tool. `docs/` fetches static files, not the API (I-7
untouched), and imports nothing from `src/`. Cost: the headings and columns named
in `docs/config.js` become a contract — renaming one breaks that section, which
then shows an error; inline markdown beyond bold, italic, code and links renders
as text.

### ADR-011 — Docs sections are hash views of one page, not one file each
**2026-10-29 · Accepted** (TASK-018). Every section renders on load and only one
is shown; `#<id>` picks it. Rejected: one `.html` per section — each would fetch
every file again to resolve references to other sections' cards, and
`markMissingRefs` could not see them. Cost: the first view waits for all files;
search and list page reset on reload.

### ADR-012 — Site map is a table in `architecture.md`, not read out of `src/`
**2026-11-03 · Accepted** (TASK-019). Each page's parent, purpose and moves are a
row in `## Site Map`; the `#sitemap` section loads each page file to check it.
Rejected: reading links out of `src/` and the HTML — the moves are
`window.location.href` calls behind conditions (`src/action-button.js`), so it
would take a JavaScript parser, and code does not state a page's purpose. Cost:
a removed page is flagged, an added page with no row is not; `Goes to` can drift
from the code unnoticed. Only the rule in [`conventions.md`](conventions.md)
covers either.

### ADR-013 — Marking a Task done stops its Timer on the server
**2026-11-05 · Accepted** (TASK-011), answers Q-2. `PUT` with `done: true` closes
an open TimeEntry before setting the flag, so tracked time stops when the work
does. Rejected: keeping the Timer running — a done Task would go on counting, and
hiding Start on it (TASK-020) would leave no way to stop it. Cost: `tasks.service`
imports `timer.repository`; reopening does not resume the Timer; closing and
updating are two statements, so a failure between them leaves a stopped Timer on
a Task that is not done, which a retry fixes.

### ADR-014 — Entity cards are assembled from existing files and linked by name
**2026-11-07 · Accepted** (TASK-022). `#entities` builds one card per concept from
`ontology.md` (Concepts, Relations, Invariants, Open Questions) and `## Concept → Code`
above; a rule belongs to a card when it names the concept as a whole word. After
render, any `code` or bold span whose text is a concept name links to its card.
Rejected: an `entities.md` per concept — a second copy of the ontology to keep in
step; a list of names in `docs/config.js` — the same, for the names. Cost: the
`Relations` block becomes a contract (`A --verb--> B (note)`); a rule naming a concept
only in lowercase prose is not listed; a `code` span that equals a concept name by
chance is linked.

### ADR-015 — `.ai/` files open rendered in the docs page, at `#file/<path>`
**2026-11-07 · Accepted** (TASK-023). A link to a `.md` under `.ai/` opens a view
of that file on the docs page, with the markdown reader every section uses;
`#file/<path>#<heading>` scrolls to a heading. Rejected: a second page,
`file.html?path=` — refs and concept names in the file would link to cards it does
not have (ADR-011's reason again); a markdown library — a dependency (ADR-003).
Cost: a raw `.md` opened by its own URL stays unstyled; only the view's source link
reaches the raw text; a file loads once per page load, so an edit needs a reload.

### ADR-016 — Accounts: bcrypt passwords, short access JWTs, rotating refresh tokens
**2026-11-21 · Accepted** (TASK-025). Passwords are bcrypt hashes (`BCRYPT_ROUNDS`,
default 12). Sign-in returns a 15-minute access JWT, sent as `Authorization: Bearer`,
and sets a 7-day refresh JWT as an `HttpOnly; Secure; SameSite=Strict` cookie scoped
to `/api/auth`. The database keeps only the refresh token's SHA-256; each refresh
revokes it and issues a new one, and reusing a revoked one revokes all of that
User's tokens (I-13). New dependencies: `bcryptjs`, `jsonwebtoken`, `zod` (all input
validation), `express-rate-limit` (5 sign-ins or registrations per IP per minute).
Rejected: a server session cookie on every route — every write would need CSRF
protection, plus `express-session`; one long-lived JWT — sign-out could not end it on
the server; tokens in `localStorage` — readable by any script on the page. Cost: two
secrets to manage; an access token stays valid up to 15 minutes after sign-out; four
dependencies; rate-limit counts live in memory and reset on restart.

### ADR-017 — Migrations run once, tracked in `schema_migrations`, with `.down.sql`
**2026-11-21 · Accepted** (TASK-025). `npm run migrate` applies only files not yet in
`schema_migrations`; `npm run migrate:down` runs the last one's `NNN_<what>.down.sql`.
Rejected: re-running every file — MySQL 8 has no `ADD COLUMN IF NOT EXISTS`, so 004
cannot be idempotent; a migration library (`knex`, `umzug`) — a dependency for ~60
lines. Cost: MySQL cannot roll back DDL, so a file that fails halfway leaves part of
it applied and unrecorded; down files are hand-written and can drift from the up file.

### ADR-018 — A Task's owner is stored on `tasks` only
**2026-11-21 · Accepted** (TASK-025). `tasks.user_id`; TimeEntry queries join `tasks`
and filter `user_id = ?`, so a Timer's owner is its Task's. Rejected:
`time_entries.user_id` as well — the owner stored twice can drift. Cost: every
timer query carries a join.
