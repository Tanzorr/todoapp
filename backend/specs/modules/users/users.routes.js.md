# modules/users/users.routes.js

## Purpose

Router for `/api/users`, mounted in `app.js` behind `authenticate`.

## Exports

- **Router** (`module.exports`):

| Method | Path | Middleware | Handler |
| :--- | :--- | :--- | :--- |
| GET | `/` | — | `listUsers` |
| GET | `/me` | — | `getMe` |
| PATCH | `/me` | — | `updateMe` |
| PUT | `/me/email` | `authRateLimit` | `changeEmail` |
| PUT | `/me/password` | `authRateLimit` | `changePassword` |
| DELETE | `/me` | `authRateLimit` | `deleteMe` |
| GET | `/:id` | — | `getUser` |

## Behavior / business rules

- `/me` routes come before `/:id`, so `me` is never read as an id.
- The three routes that check a password share the register/login rate limit, so a stolen access token cannot guess the password quickly.

## Dependencies

- **Imports:** `express`, `./users.controller`, `../../middleware/rate-limit`
- **Called by:** `app.js`
