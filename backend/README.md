# Todo Backend

Node.js + Express REST API for the Todo + Timer app. Every Task belongs to a User;
a request without a valid access token gets `401`.

## Requirements

- Node.js 20+
- MySQL 8+

## Setup

```bash
cd backend
cp .env.example .env
npm install
```

Then edit `.env`:

| Key | Set to |
| :--- | :--- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Your MySQL account and database (the database must exist) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Two **different** values, each at least 32 chars. Generate each with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `BCRYPT_ROUNDS` | Optional, default `12` |
| `AUTH_RATE_LIMIT` | Optional, default `5` register + login requests per IP per minute |

The server, `migrate` and the tests refuse to start while a JWT secret is missing,
shorter than 32 chars, or equal to the other.

## Database migrations

```bash
npm run migrate                                   # applies pending migrations
DB_NAME=todo_app_test npm run migrate:down        # undoes the last one
npm run migrate:down -- --force                   # same, on a database not named *_test
```

Applied migrations are recorded in `schema_migrations`; each `NNN_<what>.sql` has a
`NNN_<what>.down.sql` that undoes it.

### Existing Tasks

Migration 004 gives every Task that existed before accounts to
`legacy@todo.invalid`, a User nobody can sign in as. To move them to your account,
register it, then:

```sql
UPDATE tasks
SET user_id = (SELECT id FROM users WHERE email = 'you@example.com')
WHERE user_id = (SELECT id FROM users WHERE email = 'legacy@todo.invalid');
```

### The admin

An admin can read the list of Users and any User's profile; nothing more. No
route changes a role, so make the first admin in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Run the server

```bash
npm start
# http://localhost:3000 — health check: http://localhost:3000/health
```

## Tests

```bash
mysql -u root -p -e "CREATE DATABASE todo_app_test"   # once
npm test
```

The tests only ever use `todo_app_test`: they migrate it, generate their own JWT
secrets, and delete every User they create.

## Authentication

1. `POST /api/auth/register` `{ email, password }` — password 8 chars to 72 bytes.
2. `POST /api/auth/login` → `{ accessToken, user }` and an `HttpOnly; Secure;
   SameSite=Strict` cookie `refreshToken` on `Path=/api/auth`, valid 7 days.
3. Send `Authorization: Bearer <accessToken>` on every `/api/tasks` request. The
   token lasts 15 minutes.
4. `POST /api/auth/refresh` (cookie) → a new access token and a new cookie. Each
   refresh token works once; reusing one signs that User out everywhere.
5. `POST /api/auth/logout` (cookie) ends the session on the server.

```bash
curl -s -XPOST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
     -d '{"email":"me@example.com","password":"correct-horse"}'
TOKEN=$(curl -s -XPOST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
     -d '{"email":"me@example.com","password":"correct-horse"}' | jq -r .accessToken)
curl -s localhost:3000/api/tasks -H "Authorization: Bearer $TOKEN"
```

## API Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| POST | `/api/auth/register` | — | Create a User `{ email, password }` → `201` |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ accessToken, user }` + refresh cookie |
| POST | `/api/auth/refresh` | cookie | New access token + new cookie |
| POST | `/api/auth/logout` | cookie | Revoke the refresh token → `204` |
| GET | `/api/auth/me` | Bearer | The signed-in User |
| GET | `/api/tasks` | Bearer | List your Tasks |
| GET | `/api/tasks/:id` | Bearer | Get a Task |
| POST | `/api/tasks` | Bearer | Create a Task `{ title, description? }` |
| PUT | `/api/tasks/:id` | Bearer | Update `{ title?, description?, done? }` |
| DELETE | `/api/tasks/:id` | Bearer | Delete a Task |
| GET | `/api/tasks/:id/timer` | Bearer | Total and running state |
| POST | `/api/tasks/:id/timer/start` | Bearer | Start the Timer |
| POST | `/api/tasks/:id/timer/stop` | Bearer | Stop the Timer |
| GET | `/api/users` | Bearer, admin | Every User with `taskCount` |
| GET | `/api/users/me` | Bearer | Your profile with `taskCount` |
| GET | `/api/users/:id` | Bearer | A profile — yours, or anyone's for the admin |
| PATCH | `/api/users/me` | Bearer | Change your name `{ name }` (`''` clears it) |
| PUT | `/api/users/me/email` | Bearer | `{ email, currentPassword }` |
| PUT | `/api/users/me/password` | Bearer | `{ currentPassword, newPassword }` → `{ accessToken, user }` + new cookie; signs out everywhere else |
| DELETE | `/api/users/me` | Bearer | `{ currentPassword }` → `204`; deletes your Tasks and time too |

Another User's Task, or another User for a non-admin, answers `404`, exactly like a
missing one. A wrong `currentPassword` is `400` with `field: "currentPassword"`.
Register, login and the three password-checked `/api/users/me` routes share a limit
of 5 requests per IP per minute (`429`).

Every error is `{ "error": { "status", "code", "message", "field"? } }`, e.g.
`{ "error": { "status": 401, "code": "UNAUTHORIZED", "message": "Authentication required" } }`.

## Project Structure

```
src/
  config/env.js          — environment variables, validated on load
  db/
    pool.js              — mysql2 connection pool
    migrate.js           — migration runner (up / down)
    migrations/          — NNN_<what>.sql + NNN_<what>.down.sql
  lib/validate.js        — zod schema → 400 with field
  middleware/
    authenticate.js      — Bearer access token → req.user
    rate-limit.js        — register / login limit
    error-handler.js     — centralized error handler
    not-found.js         — 404 handler
  modules/
    auth/                — register, login, refresh, logout, me
    users/               — admin's list, profiles, name / email / password / delete
    tasks/               — tasks CRUD, per User
    timer/               — timer start/stop/total, per User
  app.js                 — Express app
  server.js              — entry point
test/                    — node:test suites (npm test)
specs/                   — one English spec per src/ file
```

See `specs/README.md` for the per-file specification convention.
