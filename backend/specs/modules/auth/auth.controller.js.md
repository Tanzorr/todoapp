# modules/auth/auth.controller.js

## Purpose

HTTP handlers for `/api/auth`. Moves the refresh token between the service and the cookie; the access token travels only in JSON.

## Exports

| Handler | Route | Success | Errors |
| :--- | :--- | :--- | :--- |
| **`register`** | `POST /register` `{ email, password }` | `201` `User` | `400` + `field`, `409`, `429` |
| **`login`** | `POST /login` `{ email, password }` | `200` `{ accessToken, user }` + refresh cookie | `400` + `field`, `401`, `429` |
| **`refresh`** | `POST /refresh` (cookie) | `200` `{ accessToken, user }` + new refresh cookie | `401` |
| **`logout`** | `POST /logout` (cookie) | `204`, cookie cleared | — |
| **`me`** | `GET /me` (`Authorization: Bearer`) | `200` `User` | `401` |

`User` is `{ id, email, createdAt }` — never `password_hash` (I-12).

## Behavior / business rules

- `logout` answers `204` and clears the cookie even when no cookie or an unknown token was sent.
- `me` reads `req.user.id`, set by `middleware/authenticate.js`.
- Every handler passes errors to `next(err)`.

## Dependencies

- **Imports:** `./auth.service`, `./auth.cookies`
- **Called by:** `auth.routes.js`
