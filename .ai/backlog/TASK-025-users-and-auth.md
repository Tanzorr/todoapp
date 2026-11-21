# TASK-025 — Users: registration, sign-in and private Tasks

| Field | Value |
| :--- | :--- |
| **Status** | `planned` — waiting for the owner to confirm the Decisions and the dependencies |
| **Priority** | P1 |
| **Value driver** | none yet — [`VALUE.md`](../business/VALUE.md) §7 lists multi-user as a non-goal; this ticket replaces that line with a new driver, V-6 *Private records* |
| **Depends on** | — |
| **Created** | 2026-11-21 |

## Goal

A person registers with an email and password, signs in, and sees only their own
Tasks and time. Another person's Task behaves exactly like one that does not exist.
Sessions last 7 days without re-entering the password, and signing out ends the
session on the server, not just in the browser.

## Ontology Touchpoints

**Concepts:** `Task`, `TimeEntry`, `Timer`, `ApiError`
**Invariants that must hold:** `I-1` (amended: the browser also keeps the httpOnly
refresh cookie), `I-2`, `I-5`, `I-7`, `I-9` (JWT secrets live in `backend/.env`), `I-10`
**New concepts:** `User`, `RefreshToken` — added to `ontology.md` in this ticket, with
three new invariants:

| # | Proposed invariant |
| :--- | :--- |
| I-11 | Every Task has exactly one owning User. Every Task and TimeEntry query is scoped to the requesting User; another User's Task answers `404`, never `403`. |
| I-12 | `password_hash` never leaves `users.repository.js` except to the sign-in check, and is never in a response. |
| I-13 | A RefreshToken is stored only as a SHA-256 hash and works once: using it revokes it. |

## Decisions

The owner confirms or changes each before building starts.

| # | Question | Proposed | Alternative |
| :--- | :--- | :--- | :--- |
| D1 | Where the owner is stored. There is no `timers` table — a Timer is derived from `time_entries` (ADR-001) | `tasks.user_id` only; every timer query joins `tasks` and filters `user_id = ?` | Also `time_entries.user_id` — owner stored twice, can drift |
| D2 | Route prefix | `/api/auth/*`, like `/api/tasks` | `/auth/*` |
| D3 | Error shape; the frontend reads `message` and `field` | Add `code`, keep `status` and `field` — additive (ADR-007) | Exactly `{ code, message }` |
| D4 | Owner of existing Tasks; SQL cannot run bcrypt | Seed user `legacy@todo.invalid` with a hash nothing matches; README gives one `UPDATE` to move those Tasks to a real account | Precomputed hash of a documented dev password — a working credential in git |
| D5 | Frontend; protected routes return `401` to today's pages | Out of scope — follow-up ticket for a sign-in page and token handling in `api-client.js` | Minimal sign-in page in this ticket |
| D6 | When `tasks.user_id` (migration 004) lands | Step 6, with the queries that fill it, so every commit runs | Step 1, with the other migrations |
| D7 | "One validation library" | `zod` for auth and inside the existing title/id validators; messages unchanged | `zod` for auth only |

**Dependencies** (backend, to approve — `conventions.md`): `bcryptjs`, `jsonwebtoken`,
`zod`, `express-rate-limit`. Not added: `cookie-parser` (one cookie, read by a helper),
`supertest` (`node:test` + global `fetch`).

## Acceptance Criteria

Run against `todo_app_test` unless stated; `$A`, `$B` are two registered users.

- [ ] AC-1 — On the dev database with existing Tasks, `npm run migrate` applies 002–004
      and every existing Task belongs to the seed user. On `todo_app_test`, migrating
      down to 001 and back up again succeeds.
- [ ] AC-2 — `POST /api/auth/register` → `201` with the user, no `password_hash`; email
      is trimmed and lowercased. Same email in any case → `409`. Bad email, or password
      under 8 chars → `400` with `field`.
- [ ] AC-3 — The stored `password_hash` is a bcrypt hash with the cost from
      `BCRYPT_ROUNDS` (default 12).
- [ ] AC-4 — `POST /api/auth/login` → `200 { accessToken, user }` and a refresh cookie that is
      `HttpOnly; Secure; SameSite=Strict`, lasts 7 days and is scoped to `Path=/api/auth`.
      Wrong password and unknown email return the same `401` body.
- [ ] AC-5 — The access token's `exp − iat` is 900 s.
- [ ] AC-6 — `POST /api/auth/refresh` → new access token and new cookie; the old row has
      `revoked_at` set. Sending the old token again → `401`, and all of that user's
      tokens are revoked.
- [ ] AC-7 — `POST /api/auth/logout` revokes the token and clears the cookie; refreshing
      with it afterwards → `401`.
- [ ] AC-8 — `GET /api/auth/me` → `200` with the user, no `password_hash`; missing,
      malformed or expired token → `401`.
- [ ] AC-9 — Every `/api/tasks` route without a valid token → `401`.
- [ ] AC-10 — `$B` reading, updating or deleting `$A`'s Task, or reading, starting or
      stopping its Timer, gets `404`; `$A`'s Task and TimeEntries are unchanged.
- [ ] AC-11 — The 6th login or register from one IP within a minute → `429`.
- [ ] AC-12 — Every error response has the shape chosen in D3, including `401`, `404`
      for unknown routes and `429`.
- [ ] AC-13 — The server refuses to start if `JWT_SECRET` or `JWT_REFRESH_SECRET` is
      missing, under 32 chars, or the two are equal.
- [ ] AC-14 — `cd backend && npm test` covers AC-2, AC-4, AC-6, AC-7, AC-10 (the request's
      test list), exits non-zero on a failure, and leaves no users behind.
- [ ] AC-15 — T-1…T-8 from [`testing.md`](../context/testing.md) still pass with a token.
- [ ] AC-16 — `backend/README.md` documents setup and the auth endpoints;
      `backend/.env.example` lists every new key.

## Out of Scope

- Frontend sign-in (D5) — follow-up ticket. Until it lands, the pages show `401` errors.
- Password reset, email verification, roles, account deletion, OAuth.
- A shared rate-limit store — counts are in memory, per process, reset on restart.
- HTTPS and deployment — non-goal in `VALUE.md`.

## Notes

**Steps** — branch `feature/auth`, one commit per step, body `Ticket: TASK-025`.

| Step | Commit | Files |
| :--- | :--- | :--- |
| 0 | `docs:` decisions | this ticket, `VALUE.md`, `ontology.md`, `architecture.md` (ADR-016 accounts and tokens, ADR-017 migration runner, ADR-018 ownership via `tasks`), `CLAUDE.md` §1 |
| 1a | `feat:` migration runner | `db/migrate.js` (`schema_migrations`, pending only, `down` undoes the last), `001_init.down.sql`, `package.json` (`migrate:down`), `stack.md`, `conventions.md` |
| 1b | `feat:` users and refresh_tokens tables | `002_create_users.sql`, `003_create_refresh_tokens.sql`, each with `.down.sql` |
| 2 | `feat:` users repository | `modules/users/users.repository.js`, `lib/validate.js` (zod → `400` with `field`) |
| 3 | `feat:` auth service | `modules/auth/auth.service.js`, `auth.repository.js`, `auth.tokens.js`, `config/env.js`, `.env.example` |
| 4 | `feat:` auth routes | `auth.routes.js`, `auth.controller.js`, `auth.validation.js`, `auth.cookies.js`, `middleware/rate-limit.js`, `app.js`, `error-handler.js`, `not-found.js` |
| 5 | `feat:` authenticate middleware | `middleware/authenticate.js`, `GET /me` |
| 6 | `feat:` per-user Tasks | `004_add_user_id_to_tasks.sql` + `.down.sql`, `app.js`, `tasks.*` and `timer.*` controller, service, repository, validation |
| 7 | `test:` auth and access control | `backend/test/helpers.js`, `auth.test.js`, `access-control.test.js`, `package.json` (`test`), `testing.md` |
| 8 | `docs:` README, close-out | `backend/README.md`, `architecture.md`, `stack.md`, both indexes |

Every changed or new `backend/src` file updates its `backend/specs/` file in the same
commit (ADR-008).

**Design**

- Refresh token: a JWT signed with `JWT_REFRESH_SECRET`; the database keeps its SHA-256.
  Rotation revokes with `UPDATE … WHERE revoked_at IS NULL` and checks the affected
  rows, so two parallel refreshes cannot both succeed.
- Sign-in with an unknown email still runs one bcrypt compare, so timing matches a
  wrong password. Register's `409` does reveal that an email exists — the rate limit
  slows enumeration.
- Passwords are capped at 72 bytes; bcrypt ignores the rest.
- `500` responses return a generic message, not `err.message`.
- The backend stays CommonJS (ADR-004).
- MySQL cannot roll back DDL inside a transaction: a migration that fails halfway leaves
  part of it applied. `.down.sql` files use `IF EXISTS` where MySQL allows it. Rolling
  back 004 turns all users' Tasks back into one shared list; no rows are lost.

**Owner only** — the agent may not read or edit `backend/.env`:

1. Add `JWT_SECRET` and `JWT_REFRESH_SECRET` to `backend/.env`, each from
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
2. `mysql -u root -p -e "CREATE DATABASE todo_app_test"` — tests and rollback checks
   run only against a database whose name ends in `_test`.

**Related** — TASK-014 plans `node:test` API checks; step 7 builds the harness it can
reuse. `backend/.env` is already untracked (`git ls-files backend/.env` empty on
2026-11-21), so the new secrets stay out of git.
