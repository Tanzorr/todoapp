# modules/users/users.repository.js

## Purpose

Data access for `users`. The only file that reads `password_hash` (I-12).

## Exports

- **`findById(id)`** (async): `User` `{ id, email, createdAt }`, or `null`.
- **`findCredentialsByEmail(email)`** (async): `{ id, passwordHash }`, or `null`. For the sign-in check in `auth.service.js` only.
  - **Parameters:** `email` — already trimmed and lowercased.
- **`create(email, passwordHash)`** (async): Inserts a User.
  - **Returns:** the new `User`, or `null` when the email is already taken (MySQL `ER_DUP_ENTRY` on `uq_users_email`).
  - **Throws:** any other SQL error.
- **`remove(id)`** (async): Deletes a User; MySQL cascades to its Tasks, TimeEntries and RefreshTokens. No route calls it — the test harness uses it to clean up.

## Behavior / business rules

- `rowToUser()` never includes `password_hash`; only `findCredentialsByEmail` returns it.
- `create()` relies on the unique index rather than a read-then-insert, so two parallel registrations of one email cannot both succeed.

## Dependencies

- **Imports:** `../../db/pool`
- **Called by:** `auth.service.js`, `backend/test/helpers.js`
