# modules/auth/auth.routes.js

## Purpose

Router for `/api/auth` (D2 of TASK-025), mounted in `app.js`.

## Exports

- **Router** (`module.exports`):

| Method | Path | Middleware | Handler |
| :--- | :--- | :--- | :--- |
| POST | `/register` | `authRateLimit` | `register` |
| POST | `/login` | `authRateLimit` | `login` |
| POST | `/refresh` | — | `refresh` |
| POST | `/logout` | — | `logout` |
| GET | `/me` | `authenticate` | `me` |

## Behavior / business rules

- Only register and login are rate-limited, sharing one count per IP.
- `/refresh` and `/logout` authenticate by the cookie, not by an access token, so they work after the access token has expired.

## Dependencies

- **Imports:** `express`, `./auth.controller`, `../../middleware/rate-limit`, `../../middleware/authenticate`
- **Called by:** `app.js`
