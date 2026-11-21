# middleware/rate-limit.js

## Purpose

Slows password guessing and email enumeration on `POST /api/auth/register` and `/login` (ADR-016).

## Exports

- **`authRateLimit`** (middleware): One `express-rate-limit` instance, mounted on both routes.

## Behavior / business rules

- At most `AUTH_RATE_LIMIT` (default 5) requests per client IP per 60-second window, **counted across register and login together** — the 6th of either within a minute is refused.
- A refused request goes to `errorHandler` as `429` `Too many attempts, try again in a minute`, so it is an `ApiError` with `code: "TOO_MANY_REQUESTS"`.
- Sends `RateLimit` / `RateLimit-Policy` headers (IETF draft 8); no `X-RateLimit-*` headers.

## Dependencies

- **Imports:** `express-rate-limit`, `../config/env`
- **Called by:** `auth.routes.js`

## Notes

- Counts live in memory, per process, and reset on restart. Out of scope for TASK-025: a shared store.
- The key is `req.ip`; `trust proxy` is off, so behind a proxy every client would share one count.
- `AUTH_RATE_LIMIT` exists so the test suite can lift the limit; leave it at 5 otherwise.
