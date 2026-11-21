# modules/users/users.repository.js

## Purpose

Data access for `users`. The only file that reads `password_hash` (I-12).

## Exports

- **`findById(id)`** (async): `User` `{ id, email, name, role, createdAt }` (`name` NULL → `''`), or `null`.
- **`findCredentialsByEmail(email)`** (async): `{ id, passwordHash }`, or `null` — for sign-in only. `email` already trimmed and lowercased.
- **`findPasswordHash(id)`** (async): the hash, or `null` — for the current-password check only.
- **`findAllSummaries()`** (async): every `UserSummary` (`User` + `taskCount`), by `id`.
- **`findSummaryById(id)`** (async): one `UserSummary`, or `null`.
- **`create(email, passwordHash)`** (async): the new `User`, or `null` when the email is taken (`ER_DUP_ENTRY`).
- **`updateName(id, name)`** (async): sets `name` (`null` clears it); returns the `User`.
- **`updateEmail(id, email)`** (async): the updated `User`, or `null` when the email is taken.
- **`updatePasswordHash(id, passwordHash)`** (async): returns nothing.
- **`setRole(id, role)`** (async): `'user'` or `'admin'`. No route calls it — the tests do; people use SQL (ADR-020).
- **`remove(id)`** (async): deletes the User; MySQL cascades to its Tasks, TimeEntries and RefreshTokens.

## Behavior / business rules

- `rowToUser()` never includes `password_hash`; only `findCredentialsByEmail` and `findPasswordHash` read it.
- `taskCount` comes from `LEFT JOIN tasks … GROUP BY u.id`, so a User with no Tasks counts `0`.
- Unique email is enforced by the index, not by a read-then-write, so two parallel writes cannot both take one email.

## Dependencies

- **Imports:** `../../db/pool`
- **Called by:** `users.service.js`, `auth.service.js`, `backend/test/*`
