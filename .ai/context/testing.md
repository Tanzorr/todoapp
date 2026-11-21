# Testing

A claim that something works means one of the checks below was run and its
output read. Only auth and access control are automated so far; the Task and
Timer API checks are TASK-014.

## Static checks

```bash
npm run check                                    # frontend lint + format
for f in $(git ls-files 'backend/src/*.js'); do node --check "$f"; done
```

## Automated: `cd backend && npm test`

`node:test` + global `fetch`, no extra dependency. Each `test/*.test.js` runs in its
own process, one at a time, against an in-process app on a random port.

| File | Covers |
| :--- | :--- |
| `test/auth.test.js` | TASK-025 AC-2…AC-8, AC-12 — register, login, refresh rotation and reuse, logout, `/me` |
| `test/access-control.test.js` | AC-9 (every `/api/tasks` route → `401`), AC-10 (another User's Task → `404`, unchanged) — I-11 |
| `test/rate-limit.test.js` | AC-11 — 6th register/login per minute → `429` |

- `test/helpers.js` forces `DB_NAME=todo_app_test`, refuses any database not ending in
  `_test`, migrates it up, and generates throwaway JWT secrets — `backend/.env`
  supplies only the MySQL connection. The database must exist.
- Every User a test registers is deleted afterwards, which cascades to its Tasks,
  TimeEntries and RefreshTokens.
- Exits non-zero on any failure.

## Required Checks

Run against a migrated database with the API and static server up
([`stack.md`](stack.md)). `$T` is a task id from step T-1. Every `/api/tasks` call
needs `-H "Authorization: Bearer $TOKEN"`, where `$TOKEN` is the `accessToken` from
`POST /api/auth/login` (it lasts 15 minutes); without it the answer is `401`.

| # | Check | How | Proves |
| :--- | :--- | :--- | :--- |
| T-1 | Create task | `curl -s -XPOST localhost:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Write report"}'` → 201 | I-1 |
| T-2 | Blank / 201-char title refused | same, `"title":"  "` and a 201-char title → 400, `field: "title"` | I-6, I-7 |
| T-3 | Bad id | `curl -s localhost:3000/api/tasks/abc` → 400; `/api/tasks/999999` → 404 | I-7 |
| T-4 | Start, double start | `POST …/$T/timer/start` → 201, again → 409 | **I-2** |
| T-5 | Stop, double stop | `POST …/$T/timer/stop` → 200 with `elapsedSeconds`, again → 409 | **I-2** |
| T-6 | Total | `GET …/$T/timer` → `totalSeconds` ≈ sum of intervals, `isRunning` matches | I-3, I-4, S-1 |
| T-7 | Delete cascades | `DELETE …/$T` → 204; `SELECT COUNT(*) FROM time_entries WHERE task_id=$T` → 0 | I-5, S-4 |
| T-8 | Unknown route | `curl -s localhost:3000/nope` → 404 ApiError | I-7 |
| T-9 | Browser: add → list | add page → task appears on index after redirect | V-3 |
| T-10 | Browser: timer survives reload | start, wait 5 s, reload → still running, keeps counting | **S-2** |
| T-11 | Browser: delete while running | row disappears, no console error, no further ticks | I-5 |
| T-12 | Browser: HTML in title | title `<b>x</b>` renders as literal text | I-8 |

**T-4/T-5/T-6 are the core** — they prove V-1. Run them for any change to
`modules/timer/`, `src/timer.js` or `src/api-client.js`.

## Rules

- Run it; "should work" is not a result. Paste failing output.
- A browser check states the browser and what was clicked.
- Clean up rows you created (`DELETE /api/tasks/:id`).
