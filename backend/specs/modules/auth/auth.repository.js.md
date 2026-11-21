# modules/auth/auth.repository.js

## Purpose

Data access for `refresh_tokens`. Stores and revokes RefreshTokens by their SHA-256 hash only (I-13).

## Exports

- **`create(userId, tokenHash, expiresAt)`** (async): Inserts a row. Returns nothing.
- **`findByHash(tokenHash)`** (async): `{ id, userId, expiresAt, revokedAt }` (`revokedAt` is `null` while usable), or `null`.
- **`revoke(id)`** (async): Sets `revoked_at = NOW()` only if it is still `NULL`.
  - **Returns:** `true` when this call revoked the row, `false` when it was already revoked. The single conditional `UPDATE` is what stops two parallel refreshes from both succeeding.
- **`revokeAllForUser(userId)`** (async): Revokes every unrevoked row of the User.

## Dependencies

- **Imports:** `../../db/pool`
- **Called by:** `auth.service.js`
