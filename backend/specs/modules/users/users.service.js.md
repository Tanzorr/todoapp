# modules/users/users.service.js

## Purpose

Who may read which User, and changes to your own account (TASK-027, ADR-020). `requesterId` / `userId` is always `req.user.id`.

## Exports

- **`listUsers(requesterId)`** (async): every `UserSummary`. **Throws** `404` `User not found` unless the requester is an admin.
- **`getUser(requesterId, id)`** (async): the `UserSummary`. Yourself always; anyone else only for an admin. **Throws** `404` otherwise, or when it does not exist.
- **`updateName(userId, body)`** (async): `{ name }` → updated `User`; `''` after trim clears it. **Throws** `400` `field: 'name'`.
- **`changeEmail(userId, body)`** (async): `{ email, currentPassword }` → updated `User`. **Throws** `400` (validation, or `Current password is incorrect` with `field: 'currentPassword'`), `409` `Email is already registered` with `field: 'email'`.
- **`changePassword(userId, body)`** (async): `{ currentPassword, newPassword }` → `{ accessToken, refreshToken, user }`. Revokes every RefreshToken of the User first, then starts a new session. **Throws** `400` as above, or `field: 'newPassword'`.
- **`deleteAccount(userId, body)`** (async): `{ currentPassword }` → deletes the User and, by cascade, everything it owns. **Throws** `400` as above.

## Behavior / business rules

- **404, never 403** for a non-admin (I-14), and the role is read from the database on each call, not from the token.
- **Wrong current password is `400`, not `401`:** the client renews the session on `401` and, failing that, signs the user out.
- No function changes another User — there is no `id` parameter on any write.

## Dependencies

- **Imports:** `./users.repository`, `../auth/auth.repository`, `../auth/auth.service` (`verifyPassword`, `hashPassword`, `issueSession`), `./users.validation`
- **Called by:** `users.controller.js`

## Notes

- An access token outlives a deleted User by up to 15 minutes; requests with it see no Tasks, and creating one fails on the foreign key (`500`).
