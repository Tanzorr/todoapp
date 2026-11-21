# modules/users/users.controller.js

## Purpose

HTTP handlers for `/api/users`. Every route is behind `authenticate`.

## Exports

| Handler | Route | Success | Errors |
| :--- | :--- | :--- | :--- |
| **`listUsers`** | `GET /` | `200` `UserSummary[]` | `404` |
| **`getMe`** | `GET /me` | `200` own `UserSummary` | — |
| **`getUser`** | `GET /:id` | `200` `UserSummary` | `400` bad id, `404` |
| **`updateMe`** | `PATCH /me` `{ name }` | `200` `User` | `400` |
| **`changeEmail`** | `PUT /me/email` `{ email, currentPassword }` | `200` `User` | `400`, `409`, `429` |
| **`changePassword`** | `PUT /me/password` `{ currentPassword, newPassword }` | `200` `{ accessToken, user }` + new refresh cookie | `400`, `429` |
| **`deleteMe`** | `DELETE /me` `{ currentPassword }` | `204`, cookie cleared | `400`, `429` |

`UserSummary` is `User` plus `taskCount`.

## Behavior / business rules

- `getUser` validates `:id` with `validateUserId` before calling the service.
- The refresh cookie is set and cleared through `auth.cookies.js`, so its name and flags stay in one place.
- Every handler passes errors to `next(err)`.

## Dependencies

- **Imports:** `./users.service`, `./users.validation`, `../auth/auth.cookies`
- **Called by:** `users.routes.js`
