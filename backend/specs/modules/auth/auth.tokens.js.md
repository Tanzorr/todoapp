# modules/auth/auth.tokens.js

## Purpose

Signs, verifies and hashes the two JWTs of ADR-016. No database access.

## Exports

- **`REFRESH_TOKEN_TTL_SECONDS`** (number): `604800` (7 days); the cookie's `Max-Age` uses it.
- **`signAccessToken(userId)`**: HS256 JWT signed with `JWT_SECRET`, `sub` = user id as a string, `exp − iat = 900`.
- **`signRefreshToken(userId)`**: `{ token, expiresAt }` — HS256 JWT signed with `JWT_REFRESH_SECRET`, `sub` = user id, a random `jti`, 7-day expiry; `expiresAt` is a `Date` equal to the token's `exp`.
- **`verifyAccessToken(token)`** / **`verifyRefreshToken(token)`**: the user id (positive integer), or `null` when the token is missing, malformed, expired, signed with the other secret, uses another algorithm, or has a non-numeric `sub`. Never throw.
- **`hashToken(token)`**: SHA-256 hex (64 chars) — what `refresh_tokens.token_hash` stores (I-13).

## Behavior / business rules

- Only `HS256` is accepted on verify, so an `alg: none` token is rejected.
- The `jti` makes two refresh tokens issued to one User in the same second differ; without it their hashes would collide on `uq_refresh_tokens_hash`.

## Dependencies

- **Imports:** `crypto`, `jsonwebtoken`, `../../config/env`
- **Called by:** `auth.service.js`, `middleware/authenticate.js`, `auth.cookies.js`
