# modules/auth/auth.service.js

## Purpose

Registration, sign-in, refresh-token rotation and sign-out (ADR-016). Knows nothing about HTTP cookies; the controller moves tokens in and out of them.

## Exports

- **`register(body)`** (async): Validates, hashes the password with bcrypt at `BCRYPT_ROUNDS`, creates the User.
  - **Returns:** `User` `{ id, email, createdAt }`.
  - **Throws:** `400` with `field` (validation); `409` `Email is already registered`, `field: 'email'`.
- **`login(body)`** (async): Checks the password.
  - **Returns:** `{ accessToken, refreshToken, user }`; the refresh token's hash is stored.
  - **Throws:** `400` (validation); `401` `Invalid email or password` — the same for an unknown email and a wrong password.
- **`refresh(refreshToken)`** (async): Rotates.
  - **Returns:** a new `{ accessToken, refreshToken, user }`; the presented token's row is revoked.
  - **Throws:** `401` `Invalid or expired refresh token` when the token is missing, fails verification, is unknown, or was already revoked. In the last case **every** token of that User is revoked first (I-13).
- **`logout(refreshToken)`** (async): Revokes the token's row if it exists. Never throws for a missing or unknown token.
- **`getCurrentUser(userId)`** (async): The `User`, or `401` `Authentication required` if it no longer exists.
- **`issueSession(user)`** (async): `{ accessToken, refreshToken, user }`; stores the refresh token's hash. Used by `login`, `refresh` and the password change in `users.service.js`.
- **`hashPassword(password)`** (async): bcrypt hash at `BCRYPT_ROUNDS`.
- **`verifyPassword(userId, password)`** (async): `true` if it matches the User's hash; `false` for a wrong password or a missing User. Used for the current-password check (I-12).

## Behavior / business rules

- **Timing:** with an unknown email, sign-in still runs one bcrypt compare, against a dummy hash computed once on first use.
- **Rotation race:** revocation is a conditional `UPDATE`; if it changes no row, another request used the token first, and this one is treated as reuse.
- Register's `409` does reveal that an email exists; the rate limit slows enumeration.
- Register does not sign in; the client calls `login` next.
- `password_hash` reaches this file only from `findCredentialsByEmail`, and only for `bcrypt.compare` (I-12).

## Dependencies

- **Imports:** `bcryptjs`, `../users/users.repository`, `./auth.repository`, `./auth.tokens`, `./auth.validation`, `../../config/env`
- **Called by:** `auth.controller.js`, `users.service.js`
